import React, { createContext, useState } from 'react';

export const GlobalMessageContext = createContext();

export const GlobalMessageProvider = ({ children }) => {
  const [successMessages, setSuccessMessages] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);

  const showSuccessMessage = (message) => {
    const id = Date.now(); // 为每条消息生成唯一 ID
    setSuccessMessages((prevMessages) => [...prevMessages, { id, message }]);

    setTimeout(() => {
      setSuccessMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));
    }, 3000); // 3 秒后移除该消息
  };

  const showErrorMessage = (message) => {
    const id = Date.now(); // 为每条消息生成唯一 ID
    setErrorMessages((prevMessages) => [...prevMessages, { id, message }]);

    setTimeout(() => {
      setErrorMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));
    }, 3000); // 3 秒后移除该消息
  };

  return (
    <GlobalMessageContext.Provider
      value={{
        successMessages,
        errorMessages,
        showSuccessMessage,
        showErrorMessage,
      }}
    >
      {children}
    </GlobalMessageContext.Provider>
  );
};