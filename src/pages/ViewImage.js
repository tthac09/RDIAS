import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';  // 获取路由参数和历史记录
import { getImageDetails } from '../services/api.ts';  // 后端API请求
import styles from '../styles/ViewImage.module.css';  // 导入样式

const ViewImage = () => {
  const { id } = useParams();  // 获取图像ID
  const [image, setImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const history = useHistory();  // 获取历史记录，用于导航

  // 获取图像详情
  useEffect(() => {
    const fetchImageDetails = async () => {
      try {
        const response = await getImageDetails(id);
        if (response.success) {
          setImage(response.data);
        } else {
          setErrorMessage('无法加载图像详情');
        }
      } catch (error) {
        setErrorMessage('加载图像详情失败');
      }
    };
    fetchImageDetails();
  }, [id]);

  // 返回按钮点击事件
  const handleBackClick = () => {
    history.push('/ray-image-management');  // 跳转到 ray-image-management 路由
  };

  if (errorMessage) {
    return <p className={styles.error}>{errorMessage}</p>;
  }

  if (!image) {
    return <p className={styles.loadingText}>加载中...</p>;
  }

  return (
    <div className={styles.viewImageContainer}>
      <h2>图像详情</h2>
      <div className={styles.imageDetails}>
        <img
          src={`http://localhost:5000/uploads/${image.filename}`} // 图像URL
          alt="Image Detail"
        />
        <p><strong>文件名:</strong> {image.filename}</p>
        <p><strong>上传时间:</strong> {new Date(image.uploadedAt).toLocaleString()}</p>
        <p><strong>描述:</strong> {image.description || '无描述'}</p>
      </div>
      <button className={styles.backButton} onClick={handleBackClick}>返回</button>  {/* 返回按钮 */}
    </div>
  );
};

export default ViewImage;
