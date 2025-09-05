import React from "react";
import ReactDOM from "react-dom";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";

const Chating = () => {
  return (
    <MainContainer
      style={{
        width: 500,
        margin: "auto",
        height: "80vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ChatContainer>
        <MessageList>
          <Message
            model={{
              message: "1",
              direction: "incoming",
              position: "first",
            }}
          />
          <Message
            model={{
              message: "2",
              direction: "outgoing",
              position: "first",
            }}
          />
        </MessageList>
        <MessageInput placeholder="메세지 작성" />
      </ChatContainer>
    </MainContainer>
  );
};
export default Chating;
