// src/routes.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Login from './pages/Login';
import FunctionSelection from './pages/FunctionSelection';  // 后面会添加的功能选择页面
import UserManagement from './pages/UserManagement';  // 后面会添加的用户管理页面
import RayImageManagement from './pages/RayImageManagement';  // 后面会添加的射线图像管理页面
import DefectDetection from './pages/DefectDetection';  // 后面会添加的缺陷检测页面
import DefectAnalysis from './pages/DefectAnalysis';  // 后面会添加的缺陷分析页面
import ModelManagement from './pages/ModelManagement';  // 后面会添加的模型管理页面
import ReportManagement from './pages/ReportManagement';  // 后面会添加的报告管理页面
import { AuthProvider } from './context/AuthContext';  // 引入AuthProvider
import { GlobalMessageProvider } from './context/GlobalMessageContext';  // 引入GlobalMessageProvider
import GlobalMessagePopup from './components/GlobalMessagePopup';  // 引入GlobalMessagePopup
import PrivateRoute from './components/PrivateRoute';  // 引入PrivateRoute
import ViewImage from './pages/ViewImage';  // 后面会添加的图像查看页面
import Header from './components/Header';  // 引入Header组件
import ChangePasswordPage from './pages/ChangePasswordPage';

const Routes = () => {
  return (
    <GlobalMessageProvider>  {/* 用 GlobalMessageProvider 包裹整个应用 */}
      <GlobalMessagePopup />  {/* 在所有页面顶部显示全局消息弹窗 */}
      <AuthProvider>  {/* 用 AuthProvider 来包裹整个应用 */}
        <Router>
          <Header />  {/* 在所有页面顶部显示 Header */}

          <Switch>
            <Route exact path="/login" component={Login} />  {/* 登录页面 */}
            
            {/* 用 PrivateRoute 来保护需要登录才能访问的页面 */}
            <PrivateRoute path="/function-selection" component={FunctionSelection} requiredRoles={['admin', 'tech', 'qual', 'insp']} />
            <PrivateRoute path="/user-management" component={UserManagement} requiredRoles={['admin']} />
            <PrivateRoute path="/ray-image-management" component={RayImageManagement} requiredRoles={['admin', 'tech', 'qual', 'insp']} />
            <PrivateRoute path="/view-image/:id" component={ViewImage} requiredRoles={['admin', 'tech', 'qual', 'insp']} />
            <PrivateRoute path="/defect-detection" component={DefectDetection} requiredRoles={['admin', 'insp']} />
            <PrivateRoute path="/defect-analysis" component={DefectAnalysis} requiredRoles={['admin', 'qual']} />
            <PrivateRoute path="/model-management" component={ModelManagement} requiredRoles={['admin', 'tech']} />
            <PrivateRoute path="/report-management" component={ReportManagement} requiredRoles={['admin', 'qual']} />
            <PrivateRoute path="/change-password" component={ChangePasswordPage} requiredRoles={['admin', 'tech', 'qual', 'insp']} />
            {/* admin: 管理员, tech: 技术支持人员, qual: 质量控制人员, insp: 检测工程师 */}
            <Redirect exact from="/" to="/login" />  {/* 默认重定向到登录页面 */}

          </Switch>
        </Router>
      </AuthProvider>
    </GlobalMessageProvider>
  );
};

export default Routes;