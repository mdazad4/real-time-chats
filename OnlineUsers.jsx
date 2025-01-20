import React, { useState, useEffect } from 'react';
import './OnlineUsers.css';

const OnlineUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // This would be connected to your socket instance to receive online users
    // For now, we'll just show the current user
    const currentUser = localStorage.getItem('userName');
    setUsers([{ id: '1', name: currentUser }]);
  }, []);

  return (
    <div className="online-users">
      <h3>Online Users</h3>
      <div className="users-list">
        {users.map((user) => (
          <div key={user.id} className="user-item">
            <div className="user-status"></div>
            <span>{user.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnlineUsers;
