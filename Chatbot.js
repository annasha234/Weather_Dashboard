import React, { useState, useEffect, useRef } from "react";
import "./chatbot.css";

const Chatbot = ({ weatherData }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false); // ✅ Step 1: typing state
  const chatEndRef = useRef(null);

  const getAIResponse = async (msg) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          weather: weatherData || null,
        }),
      });

      const data = await res.json();
      return data.reply || "Sorry, I didn’t understand that.";
    } catch (err) {
      console.error("Error fetching AI response:", err);
      return "Oops! Something went wrong.";
    }
  };

  const sendMessage = async () => {
  if (!input.trim()) return;

  const userMsg = { sender: "user", text: input };
  setMessages((prev) => [...prev, userMsg]);
  setInput("");
  setIsTyping(true); // Show typing

  // Let the typing indicator render before the response comes in
  setTimeout(async () => {
    const aiReply = await getAIResponse(input);
    const aiMsg = { sender: "bot", text: aiReply };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false); // Hide typing
  }, 1500); // 👈 small delay (300ms) to allow Typing... to render
};


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="chatbot-container">
      <div className="chat-header">WeatherBot ☁️</div>
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div className="message bot typing">Typing</div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Ask for suggestions..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;
