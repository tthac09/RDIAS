// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// 创建 AuthContext
const AuthContext = createContext();

// 创建一个 AuthProvider 来提供上下文
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);  // 用户信息状态
  const [isAuthenticated, setIsAuthenticated] = useState(false);  // 登录状态

  // 从 localStorage 获取用户信息和认证状态
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));  // 获取用户信息
    const storedAuthStatus = localStorage.getItem('isAuthenticated') === 'true';  // 获取登录状态

    if (storedAuthStatus && storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
  }, []);  // 只在组件加载时运行一次

  // 登录成功后设置用户信息和登录状态
  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));  // 将用户信息存储到 localStorage
    localStorage.setItem('isAuthenticated', 'true');  // 设置登录状态为 true
  };

  // 退出登录
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');  // 移除用户信息
    localStorage.removeItem('isAuthenticated');  // 设置登录状态为 false
  };

  // 解构 user 来获取 username 和 role
  const username = user?.user;
  const role = user?.role;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, username, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 使用此钩子来访问上下文
export const useAuth = () => {
  return useContext(AuthContext);
};
