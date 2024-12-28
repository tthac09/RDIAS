// src/pages/FunctionSelection.js
import React from 'react';
import { useHistory } from 'react-router-dom';
import styles from '../styles/FunctionSelection.module.css';
import { useAuth } from '../context/AuthContext';

const FunctionSelection = () => {
  const history = useHistory();
  const { logout, isAuthenticated, username, role } = useAuth();

  // 跳转到不同的功能页面
  const handleNavigation = (path) => {
    history.push(path);
  };

  // 根据角色决定显示哪些按钮
  const getButtonsForRole = () => {
    switch (role) {
      case 'admin':  // 管理员
        return (
          <>
            <button onClick={() => handleNavigation('/user-management')}>用户管理</button>
            <button onClick={() => handleNavigation('/ray-image-management')}>射线图像管理</button>
            <button onClick={() => handleNavigation('/defect-detection')}>缺陷检测</button>
            <button onClick={() => handleNavigation('/defect-analysis')}>缺陷分析</button>
            <button onClick={() => handleNavigation('/model-management')}>模型管理</button>
            <button onClick={() => handleNavigation('/report-management')}>检测报告管理</button>
          </>
        );
      case 'tech':  // 技术支持员
        return (
          <>
            <button onClick={() => handleNavigation('/ray-image-management')}>射线图像管理</button>
            <button onClick={() => handleNavigation('/model-management')}>模型管理</button>
          </>
        );
      case 'qual':  // 质量管理员
        return (
          <>
            <button onClick={() => handleNavigation('/defect-analysis')}>缺陷分析</button>
            <button onClick={() => handleNavigation('/report-management')}>检测报告管理</button>
          </>
        );
      case 'insp':  // 检测工程师
        return (
          <>
            <button onClick={() => handleNavigation('/ray-image-management')}>射线图像管理</button>
            <button onClick={() => handleNavigation('/defect-detection')}>缺陷检测</button>
            <button onClick={() => handleNavigation('/defect-analysis')}>缺陷分析</button>
            <button onClick={() => handleNavigation('/report-management')}>检测报告管理</button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.functionSelectionContainer}>
      <h2>功能选择</h2>
      <div className={styles.buttonContainer}>
        {getButtonsForRole()}
      </div>
    </div>
  );
};

export default FunctionSelection;