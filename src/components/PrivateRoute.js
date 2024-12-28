import React, { useState, useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// PrivateRoute 用来保护需要登录且有权限的路由
const PrivateRoute = ({ component: Component, requiredRoles, ...rest }) => {
  const { isAuthenticated, user } = useAuth();  // 获取用户状态
  const [errorMessage, setErrorMessage] = useState(null);
  const [redirect, setRedirect] = useState(false);  // 控制是否重定向

  // 根据用户认证状态和角色判断错误信息
  useEffect(() => {
    if (!isAuthenticated) {
      setErrorMessage('您尚未登录，请先登录。');
    } else if (user && !requiredRoles.includes(user.role)) {
      setErrorMessage('您没有权限访问该页面.当前用户角色：' + user.role);
    } else {
      setErrorMessage(null);  // 用户已登录且角色匹配
    }
  }, [isAuthenticated, user, requiredRoles]);

  // 控制延迟重定向
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setRedirect(true);  // 延迟后设置重定向
      }, 2000);  // 设置2秒钟的延迟时间，用户可以看到错误信息

      return () => clearTimeout(timer);  // 清除定时器
    }
  }, [errorMessage]);

  if (redirect) {
    return <Redirect to="/login" />;  // 重定向到登录页面
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        errorMessage ? (  // 如果存在错误信息，显示错误
          <>
            <div>{errorMessage}</div>  {/* 显示错误信息 */}
          </>
        ) : (
          <Component {...props} />  // 如果已登录且角色匹配，渲染目标组件
        )
      }
    />
  );
};

export default PrivateRoute;
