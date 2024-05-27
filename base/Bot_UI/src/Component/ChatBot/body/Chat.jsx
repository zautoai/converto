// src/ChatBot.js
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import ChatsConversion from "./ChatsConversion";

const Chat = ({handleClick}) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi there, welcome to Intercom 👋" },
  ]);
  const [userInput, setUserInput] = useState("");

  const handleSendMessage = () => {
    if (userInput.trim()) {
      const newMessages = [...messages, { sender: "user", text: userInput }];
      setMessages(newMessages);
      setUserInput("");

      // Simulate receiving a message after sending a message
      setTimeout(() => {
        setMessages([
          ...newMessages,
          { sender: "bot", text: "How can we help you today?" },
        ]);
      }, 1000);
    }
  };
  

  return (
    <div  >
      <div>
        <div  className="d-flex flex-column w-100 p-2">
          <div style={{height:'75vh',overflowX:'auto'}} className="mb-3 p-2 w-100">
            {messages.map((msg, index) => (
            <ChatsConversion  key={index} msg={msg}/>

            ))}
          </div>
          <div >
            <div  className="input-group  p-2">
              <input
                type="text"
                className="form-control"
                placeholder="Sent us a message"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button className="btn btn-dark" onClick={handleSendMessage}>
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
