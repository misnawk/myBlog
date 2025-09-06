import React, { useEffect, useState } from "react";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";

// 환경/도메인 기반 WS URL 생성
function resolveWsUrl() {
  // 1) 환경변수 우선
  const vite = typeof import.meta !== "undefined" ? import.meta.env?.VITE_WS_URL : null;
  const cra  = typeof process !== "undefined" ? process.env?.REACT_APP_WS_URL : null;
  if (vite) return vite;
  if (cra)  return cra;

  // 2) 기본값 (로컬: localhost:7777/ws, 운영: 같은 도메인 /ws)
  const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const scheme = window.location.protocol === "https:" ? "wss" : "ws";
  return isLocal ? "ws://localhost:7777/ws" : `${scheme}://${window.location.host}/ws`;
}

const Chating = () => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [mySid, setMySid] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(resolveWsUrl());
    setSocket(ws);

    ws.onopen = () => console.log("웹소켓 연결됨");
    ws.onerror = (err) => console.error("웹소켓 오류:", err);
    ws.onclose = (e) => console.log("웹소켓 종료:", e.code, e.reason);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // 서버가 내 sid를 알려주는 메타 이벤트
        if (data.type === "meta") {
          setMySid(data.sid);
          return;
        }

        // 시스템 메시지
        if (data.type === "system") {
          setMessages((prev) => [
            ...prev,
            { message: data.message, direction: "incoming", position: "first" },
          ]);
          return;
        }

        // 채팅 메시지
        if (data.type === "user") {
          const direction = data.senderSid && mySid && data.senderSid === mySid
            ? "outgoing"
            : "incoming";
          setMessages((prev) => [
            ...prev,
            { message: `${data.user}: ${data.message}`, direction, position: "first" },
          ]);
          return;
        }
      } catch (e) {
        console.error("수신 파싱 에러:", e);
      }
    };

    return () => ws.close();
  }, []); // mount 시 1회

  // 메시지 전송
  const sendMessage = (text) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: "message", message: text }));
  };

  return (
    <MainContainer style={{ margin: "auto", height: "80vh", width: "100%" }}>
      <ChatContainer>
        <MessageList>
          {messages.map((m, i) => (
            <Message key={i} model={m} />
          ))}
        </MessageList>
        <MessageInput placeholder="메세지 작성" onSend={sendMessage} />
      </ChatContainer>
    </MainContainer>
  );
};

export default Chating;
