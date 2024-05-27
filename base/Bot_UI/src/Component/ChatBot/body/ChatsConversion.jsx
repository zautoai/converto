import { React, useState } from "react";

function ChatsConversion({ index, msg }) {
  return (
    <div>
      <div
        key={index}
        className={`d-flex mb-2 ${
          msg.sender === "user" ? "justify-content-end" : ""
        }`}
      >
        <div
          className={`p-2 ${
            msg.sender === "user" ? "bg-dark text-white" : "bg-light"
          }`}
          style={{ borderRadius: "10px" }}
        >
          {msg.text}
        </div>
      </div>
    </div>
  );
}

export default ChatsConversion;
