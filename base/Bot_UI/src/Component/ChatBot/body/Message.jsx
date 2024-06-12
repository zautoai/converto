import React from "react";

function Message({ handleClick }) {
  return (
    <div
      className="d-flex aligh-item-center flex-column justify-content-center text-center"
    >
      <div>
        <span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="33"
            height="32"
            fill="none"
            viewBox="0 0 33 32"
          >
            <path
              fill="#000"
              fill-rule="evenodd"
              d="M27.333 2.667a2.5 2.5 0 0 1 2.5 2.5v23.778c0 1.335-1.613 2.005-2.558 1.063L21.245 24H5.667a2.5 2.5 0 0 1-2.5-2.5V5.167a2.5 2.5 0 0 1 2.5-2.5z"
              clip-rule="evenodd"
            ></path>
            <path
              fill="#fff"
              fill-rule="evenodd"
              d="M23 9.667a1 1 0 0 1 0 2H9.667a1 1 0 1 1 0-2zm-6 6.666a1 1 0 1 1 0 2h-6.667a1 1 0 0 1 0-2z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </span>
      </div>
      <div>
        <h4>No Messages</h4>
      </div>
      <div>
        <span>Messages from the team will be shown here</span>
      </div>
      <div onClick={() => handleClick(5)} className="mt-5">
        <button className="bg-dark text-white p-1 py-2 px-3 rounded border-0 ">
          Sent Us a Message{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 16 16"
          >
            <path
              fill="currentColor"
              fill-rule="evenodd"
              d="m4.394 14.7 9.356-5.4c1-.577 1-2.02 0-2.598L4.394 1.299a1.5 1.5 0 0 0-2.25 1.3v3.438l4.059 1.088c.494.132.494.833 0 .966l-4.06 1.087v4.224a1.5 1.5 0 0 0 2.25 1.299"
              clip-rule="evenodd"
            ></path>
          </svg>
        </button>{" "}
      </div> 
    </div>
  );
}

export default Message;
