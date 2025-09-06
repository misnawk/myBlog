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
  const user = { sid, id, nickname: id };
  users.set(ws, user);

  // 클라이언트에게 자신의 sid 전달
  ws.send(JSON.stringify({
    type: 'meta',
    sid,
    nickname: user.nickname,
    timestamp: new Date().toISOString(),
  }));

  // 입장 알림
  broadcast({
    type: 'system',
    message: `${user.nickname}님이 입장했습니다.`,
    timestamp: new Date().toISOString(),
  });

  ws.on('message', (buf) => {
    try {
      const data = JSON.parse(buf.toString());

      if (data.type === 'nickname') {
        const old = user.nickname;
        user.nickname = (data.nickname || user.id).trim();
        broadcast({
          type: 'system',
          message: `${old}님이 ${user.nickname}으로 닉네임을 변경했습니다.`,
          timestamp: new Date().toISOString(),
        });
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
      broadcast({
        type: 'system',
        message: `${u.nickname}님이 퇴장했습니다.`,
        timestamp: new Date().toISOString(),
      });
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
