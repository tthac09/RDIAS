// src/pages/UserManagement.js
import React, { useEffect, useState, useContext } from 'react';
import { GlobalMessageContext } from '../context/GlobalMessageContext';
import { getUsers, deleteUser, addUser, updateUser, resetUserPassword } from '../services/api.ts';  // 假设 resetUserPassword 是新增的API请求
import styles from '../styles/UserManagement.module.css';
import { singleConfirm, doubleConfirm } from '../components/Confirmations';
import { message } from 'antd';
import { useAuth } from '../context/AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: 'AAAAaaaa1111', role: '' });
  const [editedUser, setEditedUser] = useState(null);  // 编辑的用户
  const [errorMessage, setErrorMessage] = useState('');
  const { logout, isAuthenticated, username, role } = useAuth();
  const { showSuccessMessage, showErrorMessage } = useContext(GlobalMessageContext);

  // 密码验证函数
  const validatePassword = (password) => {
    // 正则表达式：至少10位，包含数字、大写字母和小写字母
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{10,}$/;
    return regex.test(password);
  };

  // 获取用户列表
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        if (response.success) {
          setUsers(response.data);
        }
      } catch (error) {
        showErrorMessage('加载用户失败');
      }
    };
    fetchUsers();
  }, []);

  // 处理添加用户
  const handleAddUser = async () => {
    // 检查用户名、密码、角色是否有值
    if (!newUser.username || !newUser.password || !newUser.role) {
      showErrorMessage('请填写完整用户名、密码和角色！');
      return;
    }

    // 验证密码
    if (!validatePassword(newUser.password)) {
      showErrorMessage('密码必须至少10位，并包含数字、大写字母和小写字母！');
      return;
    }

    try {
      const response = await addUser(newUser);
      if (response.success) {
        // 清空新用户输入框
        setNewUser({ username: '', password: 'AAAAaaaa1111', role: '' });

        // 刷新用户列表
        const refreshUsers = async () => {
          try {
            const response = await getUsers();
            if (response.success) {
              setUsers(response.data);
            }
          } catch (error) {
            showErrorMessage('加载用户失败');
          }
        };

        refreshUsers();
        showSuccessMessage('添加用户成功');
      }
    } catch (error) {
      showErrorMessage(error.message); // 显示后端返回的错误消息
    }
  };

  // 处理开始编辑用户
  const handleEditUser = (user) => {
    setEditedUser({ ...user });
  };

  // 处理提交编辑用户
  const handleSubmitEditUser = async () => {
    try {
      // 传递 userId 和 editedUser 的必要字段
      const response = await updateUser(editedUser.id, {
        username: editedUser.username,
        role: editedUser.role,
    }, username); // 传入当前发起用户名

      if (response.success) {
        setUsers(
          users.map((user) => (user.id === editedUser.id ? editedUser : user))
        );
        setEditedUser(null); // 关闭编辑表单
        showSuccessMessage('编辑用户信息成功');
      } else {
        showErrorMessage(response.message || '编辑用户信息失败');
      }
    } catch (error) {
      showErrorMessage(error.message || '编辑用户信息失败');
    }
  };

  // 处理删除用户
  const handleDelete = async (userId) => {
    doubleConfirm(
      {
        title: '确认删除',
        content: '您确定要删除该用户吗？',
        okText: '确认删除',
        cancelText: '取消',
      },
      async () => {
        try {
          const response = await deleteUser(userId);
          if (response.success) {
            setUsers(users.filter((user) => user.id !== userId));
            showSuccessMessage('删除用户成功');
          }
        } catch (error) {
          showErrorMessage('删除用户失败');
        }
      }
    );
  };

  // 处理重置密码
  const handleResetPassword = async (userId) => {
    doubleConfirm(
      {
        title: '确认重置密码',
        content: '您确定要重置该用户的密码吗？',
        okText: '确认重置',
        cancelText: '取消',
      },
      async () => {
        const newPassword = 'AAAAaaaa1111'; // 重置密码为固定值
        try {
          const response = await resetUserPassword(userId, newPassword);
          if (response.success) {
            showSuccessMessage('重置密码成功');
          }
        } catch (error) {
          showErrorMessage('重置密码失败');
        }
      }
    );
  };

  const roleMap = {
    admin: '管理员',
    tech: '技术支持员',
    qual: '质量控制员',
    insp: '检测工程师'
  };

  return (
    <div className={styles.userManagementContainer}>
      <h2>用户管理</h2>
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}
  
      {/* 添加用户表单 */}
      <div className={styles.addUserForm}>
        <h3>添加新用户</h3>
        <input
          type="text"
          placeholder="用户名"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
        />
        <input
          type="text"  // 将 type 从 password 改为 text
          placeholder="密码"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
        />
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
        >
          <option value="">选择角色</option>
          {Object.entries(roleMap).map(([key, value]) => (
            <option key={key} value={key}>{`${value} (${key})`}</option>
          ))}
        </select>
        <button onClick={handleAddUser}>添加用户</button>
      </div>
  
      {/* 用户列表 */}
      <div className={styles.userList}>
        <h3>用户列表</h3>
        <table>
          <thead>
            <tr>
              <th>用户名</th>
              <th>角色</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  {editedUser && editedUser.id === user.id ? (
                    <input
                      type="text"
                      value={editedUser.username}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, username: e.target.value })
                      }
                    />
                  ) : (
                    user.username
                  )}
                </td>
                <td>
                  {editedUser && editedUser.id === user.id ? (
                    <select
                      value={editedUser.role}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, role: e.target.value })
                      }
                    >
                      {Object.entries(roleMap).map(([key, value]) => (
                        <option key={key} value={key}>{`${value} (${key})`}</option>
                      ))}
                    </select>
                  ) : (
                    `${roleMap[user.role]} (${user.role})`
                  )}
                </td>
                <td>
                  {editedUser && editedUser.id === user.id ? (
                    <button onClick={handleSubmitEditUser}>提交</button>
                  ) : (
                    <>
                      <button onClick={() => handleDelete(user.id)}>删除</button>
                      <button onClick={() => handleEditUser(user)}>编辑</button>
                      <button onClick={() => handleResetPassword(user.id)}>重置密码</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;