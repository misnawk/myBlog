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

// 포트 번호
const port = 7777;
// 호스트 이름
const host = window.location.hostname;

const Chating = () => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // 인스턴스 생성과 동시에 연결요청
    const socket = new WebSocket(`${protocol}//${host}:${port}`);
    setSocket(socket);

    //소켓연결이 되었다면 소켓에 메시지를 보낼 수 있게 해준다.
    socket.onopen = () => {
      console.log("웹소켓이 연결되었습니다.");
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
