import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUsers, FaPaperPlane, FaSmile, FaImage, FaVideo, FaTimes, FaCamera } from 'react-icons/fa';
import { io } from 'socket.io-client';
import OnlineUsersList from './OnlineUsersList';
import CameraModal from './CameraModal'; 
import './ChatRoom.css';

const socket = io('http://localhost:3001');

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showUsersList, setShowUsersList] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showCamera, setShowCamera] = useState(false); 
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const navigate = useNavigate();
  const currentUser = localStorage.getItem('username') || 'Anonymous';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    // Join chat
    socket.emit('user_join', currentUser);

    // Listen for messages
    socket.on('chat_message', (message) => {
      setMessages(prev => [...prev, {
        ...message,
        isSent: message.sender === currentUser
      }]);
    });

    // Listen for online users updates
    socket.on('user_online', ({ users }) => {
      setOnlineUsers(users.map(name => ({ id: name, name })));
    });

    return () => {
      socket.off('chat_message');
      socket.off('user_online');
    };
  }, [currentUser, navigate]);

  useEffect(() => {
    const handleFocus = () => {
      setIsKeyboardVisible(true);
      setTimeout(scrollToBottom, 100);
    };

    const handleBlur = () => {
      setIsKeyboardVisible(false);
    };

    const input = messageInputRef.current;
    if (input) {
      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);
    }

    return () => {
      if (input) {
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      }
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedMedia) return;

    const messageData = {
      type: 'message',
      content: newMessage,
      media: selectedMedia,
      sender: currentUser,
      isSent: true
    };

    socket.emit('send_message', messageData);
    setNewMessage('');
    setSelectedMedia(null);
    setPreviewUrl('');
    messageInputRef.current?.focus();
  };

  const handleMediaSelect = (type) => {
    try {
      if (type === 'image') {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';  
          fileInputRef.current.click();
        }
      } else if (type === 'video') {
        if (videoInputRef.current) {
          videoInputRef.current.value = '';  
          videoInputRef.current.click();
        }
      } else if (type === 'camera') {
        setShowCamera(true);
      }
      setShowMediaOptions(false);
    } catch (error) {
      console.error('Error selecting media:', error);
      alert('Error selecting media. Please try again.');
    }
  };

  const handleCameraCapture = (fileInfo, blob) => {
    handleFileSelected(fileInfo, blob);
    setShowCamera(false);
  };

  const handleFileSelected = (file, blob = null) => {
    if (!file) return;
    
    const actualFile = blob || file;
    const fileType = file.type.split('/')[0];
    const isValid = fileType === 'image' || fileType === 'video';
    
    if (!isValid) {
      alert('Please select an image or video file');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedMedia({
          type: fileType,
          url: reader.result,
          name: file.name
        });
        setPreviewUrl(reader.result);
      };
      reader.onerror = () => {
        alert('Error reading file. Please try again.');
        setSelectedMedia(null);
        setPreviewUrl('');
      };
      reader.readAsDataURL(actualFile);
    } catch (error) {
      console.error('Error handling file:', error);
      alert('Error processing file. Please try again.');
      setSelectedMedia(null);
      setPreviewUrl('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/');
  };

  const toggleUsersList = () => {
    setShowUsersList(!showUsersList);
  };

  const handleCloseUsersList = () => {
    setShowUsersList(false);
  };

  const toggleMediaOptions = () => {
    setShowMediaOptions(!showMediaOptions);
  };

  const cancelMediaUpload = () => {
    setSelectedMedia(null);
    setPreviewUrl('');
  };

  return (
    <div className={`chat-container ${isKeyboardVisible ? 'keyboard-visible' : ''}`}>
      {showCamera && (
        <CameraModal
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
      
      <header className="chat-header">
        <button onClick={handleLogout} className="logout-btn" title="Logout">
          <FaSignOutAlt />
        </button>
        <div className="header-title">
          <h1>Chat Room</h1>
          <span className="online-count">{onlineUsers.length} online</span>
        </div>
        <button 
          className="users-toggle-btn"
          onClick={toggleUsersList}
          title="Show Online Users"
        >
          <FaUsers />
          <span className="user-count">{onlineUsers.length}</span>
        </button>
      </header>

      <div className="chat-main">
        <div 
          className="chat-messages" 
          style={{ paddingBottom: isKeyboardVisible ? '60px' : '0' }}
        >
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${
                message.type === 'system' 
                  ? 'system-message' 
                  : message.sender === currentUser
                    ? 'sent-message' 
                    : 'received-message'
              } ${message.type !== 'system' ? 'with-avatar' : ''}`}
            >
              {message.type !== 'system' && (
                <div className="message-avatar">
                  {message.sender.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="message-bubble">
                {message.type === 'system' ? (
                  <div className="system-content">
                    <small>{message.content}</small>
                  </div>
                ) : (
                  <>
                    <div className="message-sender">{message.sender}</div>
                    {message.media && (
                      <div className="message-media">
                        {message.media.type === 'image' ? (
                          <img src={message.media.url} alt="Shared" />
                        ) : (
                          <video controls>
                            <source src={message.media.url} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </div>
                    )}
                    {message.content && (
                      <div className="message-content">{message.content}</div>
                    )}
                    <div className="message-timestamp">{message.timestamp}</div>
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className={`online-users-wrapper ${showUsersList ? 'show' : ''}`}>
          <OnlineUsersList 
            users={onlineUsers} 
            onClose={handleCloseUsersList}
          />
        </div>
      </div>

      {selectedMedia && (
        <div className="media-preview">
          {selectedMedia.type === 'image' ? (
            <img src={previewUrl} alt="Preview" />
          ) : (
            <video src={previewUrl} controls />
          )}
          <button className="cancel-media" onClick={cancelMediaUpload}>
            <FaTimes />
          </button>
        </div>
      )}

      <form onSubmit={handleSendMessage} className={`message-form ${isKeyboardVisible ? 'keyboard-visible' : ''}`}>
        <button type="button" className="emoji-btn" title="Add Emoji">
          <FaSmile />
        </button>
        <button 
          type="button" 
          className="media-btn" 
          onClick={toggleMediaOptions}
          title="Add Media"
        >
          <FaImage />
        </button>
        {showMediaOptions && (
          <div className="media-options">
            <button onClick={() => handleMediaSelect('camera')} title="Take Photo">
              <FaCamera />
            </button>
            <button onClick={() => handleMediaSelect('image')} title="Send Image">
              <FaImage />
            </button>
            <button onClick={() => handleMediaSelect('video')} title="Send Video">
              <FaVideo />
            </button>
          </div>
        )}
        <input
          ref={messageInputRef}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="message-input"
        />
        <button 
          type="submit" 
          className="send-btn" 
          disabled={!newMessage.trim() && !selectedMedia}
          title="Send Message"
        >
          <FaPaperPlane />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelected(e.target.files[0])}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelected(e.target.files[0])}
        />
      </form>
    </div>
  );
};

export default ChatRoom;
