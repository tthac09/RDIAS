// src/pages/Login.js
import React, { useEffect, useState, useContext } from 'react';
import { GlobalMessageContext } from '../context/GlobalMessageContext';
import { useHistory } from 'react-router-dom';
import { login } from '../services/api.ts';  // 登录请求函数
import { useAuth } from '../context/AuthContext';  // 引入AuthContext
import styles from '../styles/Login.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // 使用 react-icons

const Login = () => {
  const history = useHistory();
  const { isAuthenticated, login: setLoginStatus } = useAuth();  // 获取认证状态和登录状态控制函数
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);  // 控制密码显示状态
  const [errorMessage, setErrorMessage] = useState('');
  const [isPopupVisible, setIsPopupVisible] = useState(false);  // 控制弹窗显示状态
  const {showSuccessMessage, showErrorMessage} = useContext(GlobalMessageContext);

  useEffect(() => {
    if (isAuthenticated) {
      history.push('/function-selection');
    }
  }, [isAuthenticated, history]);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (errorMessage) {
      setErrorMessage('');
      setIsPopupVisible(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errorMessage) {
      setErrorMessage('');
      setIsPopupVisible(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(username, password);
      if (response.success) {
        setLoginStatus(response);
        showSuccessMessage('登录成功');
        history.push('/function-selection');
      } else {
        // setErrorMessage('用户名或密码错误！请重试。忘记密码请联系管理员。');
        // setIsPopupVisible(true);
        showErrorMessage('用户名或密码错误！请重试。忘记密码请联系管理员。');
      }
    } catch (error) {
      showErrorMessage('登录失败，请稍后再试');
      setIsPopupVisible(true);
    }
  };

  const closePopup = () => {
    setIsPopupVisible(false);
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);  // 切换密码显示状态
  };

  return (
    <div className={styles.loginContainer}>
      <h1 className={styles.mainTitle}>射线检测缺陷智能识别分析系统</h1>
      <h2>用户登录</h2>
      <form onSubmit={handleLogin}>
        <div className={styles.formGroup}>
          <label htmlFor="username">用户名</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={handleUsernameChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">密码</label>
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={handlePasswordChange}
              required
              className={styles.passwordInput} // 添加一个单独的 class 便于样式控制
            />
            <button
              type="button"
              className={styles.showPasswordButtonInside}
              onClick={toggleShowPassword}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
        </div>

        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        <button type="submit" className={styles.submitButton}>登录</button>
      </form>

      {isPopupVisible && (
        <div className={styles.errorPopupOverlay} onClick={closePopup}>
          <div className={styles.errorPopup} onClick={(e) => e.stopPropagation()}>
            <p>{errorMessage}</p>
            <button onClick={closePopup}>好的</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
