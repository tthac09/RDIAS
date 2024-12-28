// src/pages/ModelManagement.js
import React, { useEffect, useState, useContext } from 'react';
import { GlobalMessageContext } from '../context/GlobalMessageContext';
import { getModelList, uploadModel, deleteModel } from '../services/api.ts';  // 后端API请求
import { Link } from 'react-router-dom';
import { singleConfirm, doubleConfirm } from '../components/Confirmations';
import styles from '../styles/ModelManagement.module.css';


const ModelManagement = () => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const { showSuccessMessage, showErrorMessage } = useContext(GlobalMessageContext);

  // 获取模型列表
  useEffect(() => {
    const fetchModelList = async () => {
      try {
        const response = await getModelList();
        if (response.success) {
          setModels(response.data);
        }
      } catch (error) {
        showErrorMessage('加载模型列表失败');
      }
    };
    fetchModelList();
  }, []);

  // 选择模型查看详情
  const handleModelSelect = (model) => {
    setSelectedModel(model);
  };

  // 删除模型
  const handleDeleteModel = async (id) => {
    try {
      // 触发二次确认弹窗
      singleConfirm(
        {
          title: '删除模型',
          content: '您确定要删除此模型吗？',
          okText: '删除',
          cancelText: '取消',
        },
        async () => {
          const response = await deleteModel(id);
          if (response.success) {
            setModels(models.filter(model => model.id !== id));
            showSuccessMessage('删除模型成功');
          }
        }
      );
    } catch (error) {
      showErrorMessage('删除失败');
    }
  };

  // 处理文件上传
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // 上传新模型
  const handleUploadModel = async () => {
    if (!selectedFile) {
      showErrorMessage('请选择一个模型文件');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('model', selectedFile);

    try {
      const response = await uploadModel(formData);
      if (response.success) {
        setModels([...models, response.data]);
        setSelectedFile(null);  // 清空已选择的文件
        // 手动清空输入框的文件选择
        document.getElementById('fileInput').value = '';
        showSuccessMessage('上传模型成功');
      }
    } catch (error) {
      showErrorMessage('上传模型失败');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.modelManagementContainer}>
      <h2>模型管理</h2>
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      {/* 模型列表 */}
      <div className={styles.modelList}>
        <h3>已上传的模型</h3>
        <ul>
          {models.map(model => (
            <li key={model.id}>
              <span onClick={() => handleModelSelect(model)}>{model.name}</span>
              <button onClick={() => handleDeleteModel(model.id)}>删除</button>
            </li>
          ))}
        </ul>
      </div>

      {/* 选择模型详情 */}
      {selectedModel && (
        <div className={styles.selectedModel}>
          <h4>选中的模型</h4>
          <p>模型名称：{selectedModel.name}</p>
          <p>上传时间：{new Date(selectedModel.uploadedAt).toLocaleString()}</p>
        </div>
      )}

      {/* 上传新模型 */}
      <div className={styles.uploadModel}>
        <h3>上传新模型</h3>
        <input
          type="file"
          id="fileInput"
          accept=".pt"
          onChange={handleFileChange}
        />
        <button onClick={handleUploadModel} disabled={uploading}>
          {uploading ? '上传中...' : '上传模型'}
        </button>
      </div>
    </div>

  );
};

export default ModelManagement;
