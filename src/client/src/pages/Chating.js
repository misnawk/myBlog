import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";

// 프로토콜
const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

// 운영환경에서는 직접 WebSocket 서버에 연결
// 실제 도메인으로 운영환경 판단
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const host = window.location.hostname;
const port = 7777; // WebSocket 서버 포트
const wsPath = ''; // 직접 연결

const Chating = () => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // 인스턴스 생성과 동시에 연결요청
    const wsUrl = `${protocol}//${host}:${port}`;
    console.log('WebSocket 연결 시도:', wsUrl);
    const socket = new WebSocket(wsUrl);
    setSocket(socket);

    //소켓연결이 되었다면 소켓에 메시지를 보낼 수 있게 해준다.
    socket.onopen = () => {
      console.log("웹소켓이 연결되었습니다.");
    };

    // 연결 실패 시 에러 처리
    socket.onerror = (error) => {
      console.error("WebSocket 연결 오류:", error);
      console.log("연결 시도한 URL:", wsUrl);
    };

    socket.onclose = (event) => {
      console.log("WebSocket 연결이 종료되었습니다:", event.code, event.reason);
    };

    if (socket) {
      // 메세지 수신 이벤트
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        setMessages((prev) => [
          ...prev,
          {
            message: data.message,
            direction: data.type === "user" ? "outgoing" : "incoming",
            position: "first",
          },
        ]);
      };
    }
    // 클린업 함수
    return () => {
      socket.close();
    };
  }, []);

  // 메세지 전송 이벤트
  const sendMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "message", message: message }));
    }
  };
  return (
    <MainContainer
      style={{
        margin: "auto",
        height: "80vh",
        width: "100%",
      }}
    >
      <ChatContainer>
        <MessageList>
          {messages.map((message, index) => (
            <Message key={index} model={message} />
          ))}
        </MessageList>
        <MessageInput placeholder="메세지 작성" onSend={sendMessage} />
      </ChatContainer>
    </MainContainer>
  );
};
export default Chating;
