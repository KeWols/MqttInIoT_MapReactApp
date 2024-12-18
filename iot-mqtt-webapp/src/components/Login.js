import React, { useState } from 'react';
import '../App.css';
import Alert from './Alert';

const Login = ({ setView, userDatas }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState(null);

  const handleLogin = () => {
    if (!username || !password) {
      setAlert({ type: 'danger', message: 'Both fields are required.' });
      return;
    }

    // Check credentials
    const user = userDatas.find(
      (user) => user.username === username && user.password === password
    );

    if (user) {
      setAlert({ type: 'success', message: 'Login successful!' });
      setTimeout(() => {
        setAlert(null);
        setView('map'); // Redirect to MapPage
      }, 2000);
    } else {
      setAlert({ type: 'danger', message: 'Invalid username or password.' });
    }
  };


  const handlePwdWarning = () => {
    setAlert({
      type: "warning",
      message:
        "This feature is currently unavailable and is not planned for future release.",
    });
  };

  const handleCloseAlert = () => {
    setAlert(null);
  };

  return (
    <div className="back-g">
      {/* Alert Component */}
      {alert && <Alert type={alert.type} message={alert.message} onClose={handleCloseAlert} />}

      {/* Buttons */}
      <div className="same-login">
        <button className="login" disabled>
          Login
        </button>
        <button className="regist" onClick={() => setView('registration')}>
          Registration
        </button>
      </div>

      {/* Login Form */}
      <div className="login-box">
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
        <button onClick={handlePwdWarning}>Forget password</button>
      </div>
    </div>
  );
};

export default Login;
