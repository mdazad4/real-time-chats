import React from 'react';
import { FaCircle, FaTimes } from 'react-icons/fa';
import './OnlineUsersList.css';

const OnlineUsersList = ({ users, onClose }) => {
  return (
    <div className="online-users">
      <div className="online-users-header">
        <h2>Online Users</h2>
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
      </div>
      
      <div className="users-count">
        {users.length} {users.length === 1 ? 'person' : 'people'} online
      </div>
      
      <div className="users-list">
        {users.map((user) => (
          <div key={user.id} className="user-item">
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <div className="user-status">
                <FaCircle className="status-icon" />
                <span>Online</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="users-footer">
        <p>Click a user to start a private chat</p>
      </div>
    </div>
  );
};

export default OnlineUsersList;
