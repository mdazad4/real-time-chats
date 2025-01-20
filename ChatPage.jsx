import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { FaSignOutAlt, FaCamera, FaPaperclip, FaPaperPlane } from 'react-icons/fa';
import OnlineUsers from './OnlineUsers';
import './ChatPage.css';

const ChatPage = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');
  const fileInputRef = useRef();
  const chatContainerRef = useRef();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!userName) {
      navigate('/');
      return;
    }

    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.emit('user_connected', userName);

    newSocket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on('online_count', (count) => {
      setOnlineCount(count);
    });

    return () => newSocket.close();
  }, [userName, navigate]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleLogout = () => {
    localStorage.removeItem('userName');
    if (socket) {
      socket.disconnect();
    }
    navigate('/');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket) {
      const messageData = {
        text: message,
        sender: userName,
        timestamp: new Date().toISOString(),
      };
      socket.emit('send_message', messageData);
      setMessage('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && socket) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const messageData = {
          text: '',
          sender: userName,
          timestamp: new Date().toISOString(),
          file: {
            data: event.target.result,
            type: file.type,
            name: file.name,
          },
        };
        socket.emit('send_message', messageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Handle camera stream (you can add a modal with camera preview here)
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button onClick={handleLogout} className="logout-button">
          <FaSignOutAlt /> Logout
        </button>
        <span className="user-name">{userName}</span>
        <span className="online-count">Online: {onlineCount}</span>
      </div>

      <div className="chat-main">
        <div className="messages-container" ref={chatContainerRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender === userName ? 'own-message' : ''}`}
            >
              <div className="message-sender">{msg.sender}</div>
              <div className="message-content">
                {msg.file ? (
                  msg.file.type.startsWith('image') ? (
                    <img src={msg.file.data} alt="shared" />
                  ) : (
                    <a href={msg.file.data} download={msg.file.name}>
                      Download {msg.file.name}
                    </a>
                  )
                ) : (
                  msg.text
                )}
              </div>
              <div className="message-timestamp">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
        <OnlineUsers />
      </div>

      <form className="chat-input" onSubmit={handleSendMessage}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          accept="image/*,video/*"
        />
        <button
          type="button"
          className="icon-button"
          onClick={() => fileInputRef.current.click()}
        >
          <FaPaperclip />
        </button>
        <button type="button" className="icon-button" onClick={handleCamera}>
          <FaCamera />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" className="send-button">
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default ChatPage;
