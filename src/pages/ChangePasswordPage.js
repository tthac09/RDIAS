// src/pages/ChangePasswordPage.js
import React, { useEffect, useState, useContext } from 'react';
import { GlobalMessageContext } from '../context/GlobalMessageContext';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../services/api.ts';
import styles from '../styles/ChangePasswordPage.module.css'; // 导入 CSS 文件
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // 使用 react-icons

const ChangePasswordPage = () => {
    const { username } = useAuth(); // 从 AuthContext 中获取当前用户名
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const {showSuccessMessage, showErrorMessage} = useContext(GlobalMessageContext);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 验证新密码和确认密码是否一致
        if (newPassword !== confirmPassword) {
            showErrorMessage('新密码前后不一致，请修改');
            return;
        }

        try {
            // 调用修改密码接口
            const result = await changePassword(username, oldPassword, newPassword);
            if (result.success) {
                showSuccessMessage('密码修改成功');
                setError('');
            } else {
                showErrorMessage(result.message || '密码修改失败');
            }
        } catch (err) {
            showErrorMessage(err.message || '密码修改失败');
            setSuccess('');
        }
    };

    return (
        <div className={styles.changePasswordContainer}>
            <h1>修改密码</h1>
            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label>旧密码:</label>
                    <div className={styles.passwordWrapper}>
                        <input
                            type={showOldPassword ? 'text' : 'password'}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className={styles.passwordInput}
                            required
                        />
                        <button
                            type="button"
                            className={styles.showPasswordButtonInside}
                            onClick={() => setShowOldPassword(!showOldPassword)}
                        >
                            {showOldPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>新密码（至少10位，并包含数字、大写字母和小写字母）:</label>
                    <div className={styles.passwordWrapper}>
                        <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={styles.passwordInput}
                            required
                        />
                        <button
                            type="button"
                            className={styles.showPasswordButtonInside}
                            onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                            {showNewPassword  ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>确认新密码:</label>
                    <div className={styles.passwordWrapper}>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={styles.passwordInput}
                            required
                        />
                        <button
                            type="button"
                            className={styles.showPasswordButtonInside}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>
                </div>
                <button type="submit" className={styles.submitButton}>提交</button>
            </form>
        </div>
    );
};

export default ChangePasswordPage;