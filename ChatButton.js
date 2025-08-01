import React, { useState } from "react";
import Chatbot from "./Chatbot";
import "./chatbot.css";

const ChatButton = ({ weatherData }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && <Chatbot weatherData={weatherData} />}
      <button className="chat-float" onClick={() => setOpen(!open)}>
        💬
      </button>
    </>
  );
};

export default ChatButton;
