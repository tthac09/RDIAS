// src/components/Header.js
import React, { useEffect, useState, useContext } from 'react';
import { GlobalMessageContext } from '../context/GlobalMessageContext';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Header.module.css';

const Header = () => {
  const { logout, isAuthenticated, username, role } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const {showSuccessMessage, showErrorMessage} = useContext(GlobalMessageContext);

  const roleMap = {
    admin: '管理员',
    tech: '技术支持员',
    qual: '质量控制员',
    insp: '检测工程师'
  };

  const handleLogout = () => {
    logout();
    history.push('/login');
    //showSuccessMessage('登出成功');
  };

  const handleGoHome = () => {
    history.push('/function-selection');
  };

  const handleChangePassword = () => {
    history.push('/change-password');
  };

  if (!isAuthenticated || location.pathname === '/login') {
    return null;
  }

  return (
    <header className={styles.header}>
      <h1>射线检测缺陷智能识别分析系统</h1>
      <div className={styles['right-section']}>
        <div className={styles['user-info']}>
          <span>用户: {username}</span>
          <span>角色: {roleMap[role]}</span>
        </div>
        <button onClick={handleGoHome}>返回主页</button>
        <button onClick={handleChangePassword}>修改密码</button>
        <button onClick={handleLogout}>登出</button>
      </div>
    </header>
  );
};

export default Header;