import React, { useState } from 'react';
import Login from './Login';
import Registration from './Registration';
import './AuthTabs.css'; // CSS stílusok külön fájlban

const AuthTabs = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="auth-container">
      <div className="auth-tabs">
        <button
          className={activeTab === 'login' ? 'active' : ''}
          onClick={() => setActiveTab('login')}
        >
          Login
        </button>
        <button
          className={activeTab === 'register' ? 'active' : ''}
          onClick={() => setActiveTab('register')}
        >
          Registration
        </button>
      </div>
      <div className="auth-content">
        {activeTab === 'login' ? (
          <Login onLoginSuccess={onLoginSuccess} />
        ) : (
          <Registration />
        )}
      </div>
    </div>
  );
};

export default AuthTabs;
