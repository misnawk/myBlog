const http = require('http');
const express = require('express');
const { WebSocketServer } = require('ws');
const PORT = 7777;
const app = express();
const server = http.createServer(app);

// WebSocket 서버이므로 정적 파일 서빙 제거
// 프론트엔드는 별도 nginx 컨테이너에서 서빙

// WebSocket 서버를 HTTP 서버에 연결
const wss = new WebSocketServer({ server });

// 사용자 관리
let userCount = 0;
const users = new Map(); // WebSocket -> 사용자 정보

// 하나의 서버로 포트 열기
server.listen(PORT, () => {
  console.log(`HTTP/WebSocket 서버가 포트 ${PORT}에서 실행 중입니다.`);
});

wss.on('connection', (ws, req) => {
  userCount++;
  const userId = `사용자${userCount}`;

  // 사용자 정보 저장
  users.set(ws, {
    id: userId,
    nickname: userId,
  });

  console.log(`새로운 클라이언트가 연결되었습니다: ${userId}`);

  // 연결 알림 메시지 전송
  const connectMessage = {
    type: 'system',
    message: `${userId}님이 입장했습니다.`,
    timestamp: new Date().toISOString(),
  };

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(connectMessage));
    }
  });

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      const user = users.get(ws);

      if (data.type === 'nickname') {
        // 닉네임 변경
        const oldNickname = user.nickname;
        user.nickname = data.nickname || user.id;

        const nicknameMessage = {
          type: 'system',
          message: `${oldNickname}님이 ${user.nickname}으로 닉네임을 변경했습니다.`,
          timestamp: new Date().toISOString(),
        };

        wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify(nicknameMessage));
          }
        });
      } else if (data.type === 'message') {
        // 일반 메시지
        const message = {
          type: 'user',
          user: user.nickname,
          message: data.message,
          timestamp: new Date().toISOString(),
        };

        console.log(`${user.nickname}: ${data.message}`);

        // 모든 연결된 클라이언트에게 메시지 브로드캐스트
        wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify(message));
          }
        });
      }
    } catch (error) {
      console.error('메시지 파싱 에러:', error);
    }
  });

  ws.on('close', () => {
    const user = users.get(ws);
    console.log(`클라이언트 연결이 해제되었습니다: ${user.nickname}`);

    // 퇴장 알림 메시지 전송
    const disconnectMessage = {
      type: 'system',
      message: `${user.nickname}님이 퇴장했습니다.`,
      timestamp: new Date().toISOString(),
    };

    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(disconnectMessage));
      }
    });

    users.delete(ws);
  });

  ws.on('error', (error) => {
    console.log('WebSocket 에러:', error);
  });
});
