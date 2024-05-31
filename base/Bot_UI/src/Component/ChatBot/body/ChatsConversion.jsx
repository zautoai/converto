import { React } from 'react';
import ReactMarkdown from 'react-markdown';

function ChatsConversion({ index, msg }) {
  return (
    <div>
      <div
        key={index}
        className={`d-flex mb-2 ${
          msg.sender === 'user' ? 'justify-content-end' : ''
        }`}
      >
        <div
          className={`p-2 ${
            msg.sender === 'user' ? 'bg-dark text-white' : 'bg-light'
          }`}
          style={{ borderRadius: '10px' }}
        >
          <ReactMarkdown className={'p-0'}>{msg.text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default ChatsConversion;
