import React, { useEffect, useState } from 'react';
import Body from './ChatBot/Body';
import Head from './ChatBot/Head';
import Foot from './ChatBot/Foot';
import axios from 'axios';
import { ENDPOINT, agentId, orgId } from '../consts/systemconst';
import io from 'socket.io-client';

function Widge() {
  const [open, setOpen] = useState(1);
  const [selected, setSelected] = useState(1);
  const [footerVisible, setFooterVisible] = useState(true);
  const [backArrow, setBackArrow] = useState(false);
  const [msgVisible, setMsgVisible] = useState(false);
  const [data, setData] = useState([]);
  const [socket, setSocket] = useState(null);


  console.log(data);
  useEffect(() => {
    const socket = io(ENDPOINT, {
      query: {
        orgId: orgId,
      },
    });

    setSocket(socket);

    socket.on('connect', () => {
      console.log('Connected');
    });

    
    const payload = {
      agentId: '95b5dcd5-b69c-4927-a165-4423db4c16c8',
      vittorId: '',
      chatMessage: {
        messages: [
          {
            role:'assistant',
            content:"message"

          } 
        ]
      },
    };

    try {
      socket.emit('createConversation', payload);
    } catch (error) {
      console.error('Error emitting avatarDataReceived event:', error);
    }
  }, []);

  localStorage.setItem('orgId', orgId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          process.env.REACT_APP_BOT_API + '/api/agents/' + agentId,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-tenant-id': orgId,
            },
          },
        );
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleClick = (id) => {
    setOpen(id);
    setSelected(id);
    setFooterVisible(id !== 5);
    if (id == 5) {
      setBackArrow(true);
    } else {
      setBackArrow(false);
    }

    if (id == 1) {
      setMsgVisible(false);
    } else {
      setMsgVisible(true);
    }
  };

  return (
    <div style={{ height: '100vh' }} className="d-flex flex-column w-100">
      <div>
        <Head
          backArrow={backArrow}
          data={data}
          handleClick={handleClick}
          msgVisible={msgVisible}
        />{' '}
      </div>
      <div
        style={{ display: 'flex', justifyContent: 'center' }}
        className="h-100 w-100  align-self-center "
      >
        <Body handleClick={handleClick} open={open} data={data} />
      </div>
      <div>
        <Foot
          handleClick={handleClick}
          selected={selected}
          footerVisible={footerVisible}
        />
      </div>
    </div>
  );
}

export default Widge;
