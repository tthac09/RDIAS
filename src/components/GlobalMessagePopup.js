import React, { useContext } from 'react';
import { GlobalMessageContext } from '../context/GlobalMessageContext';
import globalstyles from '../styles/Global.module.css';

const GlobalMessagePopup = () => {
  const { successMessages, errorMessages } = useContext(GlobalMessageContext);

  return (
    <>
      {successMessages.map((msg) => (
        <div key={msg.id} className={`${globalstyles.popup} ${globalstyles.success}`}>
          <p>{msg.message}</p>
        </div>
      ))}
      {errorMessages.map((msg) => (
        <div key={msg.id} className={`${globalstyles.popup} ${globalstyles.error}`}>
          <p>{msg.message}</p>
        </div>
      ))}
    </>
  );
};

export default GlobalMessagePopup;