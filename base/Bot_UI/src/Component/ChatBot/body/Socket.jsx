import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { orgId } from '../../../consts/systemconst';

function Socket() {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [convoId, setConvoId] = useState(null);
  const [visitorId, setVisitorId] = useState(null);
  const [visitId, setVisitId] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      query: {
        orgId: orgId,
      },
    });


    setSocket(newSocket);
    newSocket.on('connect', () => {
      console.log('connected to server');
      if (!isLoaded) {
        setIsLoaded(true);
      }
    });
  }, [isLoaded]);




  const handleChange = (e) => {
    setMessage(e.target.value);
  };



  const handleSubmit = (e) => {
    e.preventDefault();
    if (message && socket) {
      console.log('Sending message:', message);
      socket.emit('sendMessage', {
        content: message,
        createdAt: new Date().toISOString(),
        role: 'user',
        type: 'TEXT',
        convoId,
      });
      setMessage('');
    }
  };

  return (
    <div>
      <div>Socket</div>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg.content}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input type="text" value={message} onChange={handleChange} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Socket;
