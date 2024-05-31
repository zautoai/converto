// src/ChatBot.js
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';

import ChatsConversion from './ChatsConversion';
import io from 'socket.io-client';
import { ENDPOINT, agentId, orgId } from '../../../consts/systemconst';

const Chat = ({ handleClick, data }) => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi there, welcome to Zauto 👋' },
  ]);
  const [userInput, setUserInput] = useState('');

  const [socket, setSocket] = useState(null);
  const [convoId, setConvoId] = useState(null);
  const [visitorId, setVisitorId] = useState(null);
  const [visitId, setVisitId] = useState(null);
  const [receive, setReceive] = useState('');

  const initializeSocket = () => {
    const socket = io(ENDPOINT, {
      query: {
        orgId: orgId,
      },
    });

    setSocket(socket);

    socket.on('connect', () => {
      console.log('connected');
    });

    socket.on('ctaselected', (data) => {
      console.log(data);
      setReceive(data);
    });

    socket.on('convCreated', (data) => {
      setConvoId(data.id);
      setVisitorId(data.visitorId);
      setVisitId(data.visitId);
      console.log(data);
    });

    socket.on('replyMessage', (data) => {
      console.log('Reply', data);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: data.message.content },
      ]);
    });

    return socket;
  };

  const createConversation = (socket) => {
    const payload = {
      agentId: agentId,
      visitId: localStorage.getItem('visitId'),
      visitorId: localStorage.getItem('visitorId'),
      chatMessage: {
        messages: [
          {
            role: 'assistant',
            content: 'message',
          },
        ],
      },
    };

    try {
      socket.emit('createConversation', payload);
    } catch (error) {
      console.error('Error emitting createConversation event:', error);
    }
  };

  useEffect(() => {
    localStorage.setItem('orgId', orgId);
    const socket = initializeSocket();
    createConversation(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    if (!socket) {
      console.error('Socket is not initialized.');
      return;
    }

    if (userInput.trim()) {
      const newMessages = [...messages, { sender: 'user', text: userInput }];
      setMessages(newMessages);
      setUserInput('');
    }

    const msgs = {
      orgId: orgId,
      convId: convoId,
      chatMessage: {
        messages: [
          {
            role: 'user',
            content: userInput,
          },
        ],
      },
    };

    try {
      socket.emit('message', msgs);
      setUserInput('');
      console.log('Message sent:', msgs);
    } catch (error) {
      console.error('Error emitting message event:', error);
    }
  };

  return (
    <div>
      <div>
        <div className="d-flex flex-column w-100 p-2">
          <div
            style={{ height: '75vh', overflowX: 'auto' }}
            className="mb-3 p-2 w-100"
          >
            {messages.map((msg, index) => (
              <div key={index}>
                <ChatsConversion data={data} msg={msg} />
                {/* {msg.sender === 'bot' && (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                )} */}
              </div>
            ))}
          </div>
          <div>
            <div className="input-group p-2">
              <input
                type="text"
                className="form-control"
                placeholder="Send us a message"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
