import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignInAlt } from 'react-icons/fa';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (accessCode === '4153') {
      localStorage.setItem('username', username);
      navigate('/chat');
    } else {
      setError('Invalid access code');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Welcome to Chat App</h1>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Enter access code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button">
            <FaSignInAlt /> Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
