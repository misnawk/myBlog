'use strict';

const http = require('http');
const express = require('express');
const { WebSocketServer } = require('ws');
const { randomUUID } = require('crypto');

const PORT = process.env.PORT || 7777;
// 쉼표로 여러 개 허용 가능: "https://app.example.com,https://admin.example.com"
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const app = express();

// 헬스체크
app.get('/healthz', (_, res) => res.status(200).send('ok'));

const server = http.createServer(app);
// WebSocket 업그레이드 경로를 /ws 로 고정
const wss = new WebSocketServer({ server, path: '/ws' });

// 연결된 사용자 저장: ws -> { sid, id, nickname }
let userSeq = 0;
const users = new Map();

// 채팅 히스토리 저장 (메모리 기반, 실제 운영에서는 DB 사용 권장)
const chatHistory = [];
const MAX_HISTORY = 100; // 최대 100개 메시지 저장

function isOriginAllowed(origin) {
  if (ALLOWED_ORIGINS.length === 0) return true; // 미설정 시 모두 허용
  try {
    const o = new URL(origin).origin;
    return ALLOWED_ORIGINS.includes(o);
  } catch {
    return false;
  }
}

function broadcast(obj) {
  const payload = JSON.stringify(obj);
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(payload);
  });
}

// 메시지를 히스토리에 저장
function saveToHistory(message) {
  chatHistory.push(message);
  
  // 히스토리 크기 제한
  if (chatHistory.length > MAX_HISTORY) {
    chatHistory.shift(); // 가장 오래된 메시지 제거
  }
  
  console.log(`메시지 히스토리 저장: ${message.type} - ${message.message || message.user}`);
}

// 히스토리를 클라이언트에게 전송
function sendHistory(ws) {
  if (chatHistory.length === 0) return;
  
  console.log(`히스토리 전송: ${chatHistory.length}개 메시지`);
  
  // 히스토리를 개별 메시지로 전송
  chatHistory.forEach(msg => {
    ws.send(JSON.stringify(msg));
  });
}

// ping/pong keepalive
function heartbeat() { this.isAlive = true; }
const interval = setInterval(() => {
  wss.clients.forEach(ws => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('connection', (ws, req) => {
  // Origin 제한 (원하면 사용)
  const origin = req.headers.origin || '';
  if (!isOriginAllowed(origin)) {
    ws.close(1008, 'Origin not allowed');
    return;
  }

  ws.isAlive = true;
  ws.on('pong', heartbeat);

  const sid = randomUUID();
  const id = `사용자${++userSeq}`;
  const user = { sid, id, nickname: null }; // 초기 닉네임을 null로 설정
  users.set(ws, user);

  // 클라이언트에게 자신의 sid 전달 (닉네임은 아직 설정되지 않음)
  ws.send(JSON.stringify({
    type: 'meta',
    sid,
    timestamp: new Date().toISOString(),
  }));

  // 입장 알림은 닉네임이 설정된 후에 보냄
  console.log(`새로운 클라이언트 연결: ${sid} (닉네임 대기 중)`);
  
  // 히스토리 전송 (닉네임 설정 전에 전송)
  sendHistory(ws);

  ws.on('message', (buf) => {
    try {
      const data = JSON.parse(buf.toString());

      if (data.type === 'nickname') {
        const old = user.nickname;
        user.nickname = (data.nickname || user.id).trim();
        
        // 디버깅 로그
        console.log(`닉네임 처리 - 이전: ${old}, 새로운: ${user.nickname}, 첫 설정: ${old === null}`);
        
        // 첫 번째 닉네임 설정인지 확인 (null에서 설정되는 경우)
        const isFirstNickname = old === null;
        
        if (isFirstNickname) {
          // 첫 번째 닉네임 설정 시 입장 알림
          const entryMessage = {
            type: 'system',
            message: `${user.nickname}님이 입장했습니다.`,
            timestamp: new Date().toISOString(),
          };
          broadcast(entryMessage);
          saveToHistory(entryMessage); // 히스토리에 저장
          console.log(`사용자 입장: ${user.nickname} (${sid})`);
        } else {
          // 닉네임 변경 시 변경 알림
          const changeMessage = {
            type: 'system',
            message: `${old}님이 ${user.nickname}으로 닉네임을 변경했습니다.`,
            timestamp: new Date().toISOString(),
          };
          broadcast(changeMessage);
          saveToHistory(changeMessage); // 히스토리에 저장
          console.log(`닉네임 변경: ${old} → ${user.nickname} (${sid})`);
        }
      }

      if (data.type === 'message') {
        const msg = {
          type: 'user',
          user: user.nickname,
          message: String(data.message ?? ''),
          senderSid: sid,
          timestamp: new Date().toISOString(),
        };
        broadcast(msg);
        saveToHistory(msg); // 히스토리에 저장
      }
    } catch (e) {
      console.error('메시지 파싱 에러:', e);
      ws.send(JSON.stringify({
        type: 'system',
        message: '메시지 파싱 에러',
        timestamp: new Date().toISOString(),
      }));
    }
  });

  ws.on('close', () => {
    const u = users.get(ws);
    if (u) {
      // 닉네임이 설정된 경우에만 퇴장 메시지 전송
      if (u.nickname && u.nickname !== null) {
        const exitMessage = {
          type: 'system',
          message: `${u.nickname}님이 퇴장했습니다.`,
          timestamp: new Date().toISOString(),
        };
        broadcast(exitMessage);
        saveToHistory(exitMessage); // 히스토리에 저장
        console.log(`사용자 퇴장: ${u.nickname} (${u.sid})`);
      } else {
        console.log(`미인증 사용자 연결 종료: ${u.sid} (닉네임 미설정)`);
      }
      users.delete(ws);
    }
  });

  ws.on('error', (err) => console.error('WebSocket 에러:', err));
});

server.listen(PORT, () => {
  console.log(`HTTP/WebSocket 서버가 포트 ${PORT}에서 실행 중입니다.`);
});

process.on('SIGTERM', () => {
  clearInterval(interval);
  server.close(() => process.exit(0));
});
