import React, { useState } from 'react';
import Login from './components/Login';
import Registration from './components/Registration';
import MapPage from './components/MapPage';
import './App.css';


const App = () => {
  const [view, setView] = useState('login');
  const [userDatas, setUserDatas] = useState([
    {
      username: 'admin',
      password: 'admin'
    },
    {
      username: 'admin0',
      password: 'admin0'
    },
    {
      username: 'admin1',
      password: 'admin1'
    },
    {
      username: 'admin2',
      password: 'admin2'
    },
    {
      username: 'admin3',
      password: 'admin3'
    }
  ]);

  const addUser = (newUser) => {
    setUserDatas((prevUsers) => [...prevUsers, newUser]);
  };

  return (
    <div>
      {view === 'login' && <Login setView={setView} userDatas={userDatas} />}
      {view === 'registration' && <Registration setView={setView} addUser={addUser} />}
      {view === 'map' && <MapPage />}
    </div>
  );
};

export default App;
