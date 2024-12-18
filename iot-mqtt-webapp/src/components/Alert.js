import React, { useState } from 'react';
import './Alert.css';

const Alert = ({ type, message, onClose }) => {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false); // Fade out animation
    setTimeout(() => onClose(), 600); // Trigger the parent close callback after the animation
  };

  return (
    visible && (
      <div className={`alert ${type} ${!visible ? 'fade-out' : ''}`}>
        <span>{message}</span>
        <button className="close-btn" onClick={handleClose}>
          ×
        </button>
      </div>
    )
  );
};

export default Alert;
