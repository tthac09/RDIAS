import React, { useEffect, useState, useRef, useContext } from 'react';
import { GlobalMessageContext } from '../context/GlobalMessageContext';
import { getImages, uploadImage, deleteImage, renameImage } from '../services/api.ts';  // 引入 renameImage
import { Link } from 'react-router-dom';
import styles from '../styles/RayImageManagement.module.css';
import globalstyles from '../styles/Global.module.css';
import { singleConfirm, doubleConfirm } from '../components/Confirmations';

const RayImageManagement = () => {
  const [images, setImages] = useState([]);
  const [newImage, setNewImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(''); // 错误消息状态
  const [successMessage, setSuccessMessage] = useState(''); // 成功消息状态
  const [editingImageId, setEditingImageId] = useState(null); // 正在编辑的图像 ID
  const [newFilename, setNewFilename] = useState(''); // 新文件名状态
  const fileInputRef = useRef(null); // 引用文件输入框
  const { showSuccessMessage, showErrorMessage } = useContext(GlobalMessageContext);

  // 获取图像列表
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await getImages();
        if (response.success) {
          setImages(response.data);
        }
      } catch (error) {
        showErrorMessage('加载图像失败');
      }
    };
    fetchImages();
  }, []);

  // 处理图像上传
  const handleImageUpload = async () => {
    if (!newImage) {
      showErrorMessage('请选择图像文件');
      return;
    }

    const formData = new FormData();
    formData.append('image', newImage);

    try {
      const response = await uploadImage(formData);
      if (response.success) {
        setImages([...images, response.data]);
        setNewImage(null);
        // 上传成功后清空文件输入框
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        showSuccessMessage('上传成功'); // 设置成功消息
      }
    } catch (error) {
      showErrorMessage('上传图像失败');
    }
  };

  // 处理删除图像
  const handleDeleteImage = async (imageId) => {
    try {
      // 触发二次确认弹窗
      singleConfirm(
        {
          title: '删除图像',
          content: '您确定要删除此图像吗？',
          okText: '删除',
          cancelText: '取消',
        },
        async () => {
          const response = await deleteImage(imageId);
          if (response.success) {
            setImages(images.filter(image => image.id !== imageId));
          }
          showSuccessMessage('删除成功'); // 设置成功消息
        }
      );
    } catch (error) {
      showErrorMessage('删除图像失败');
    }
  };

  // 处理图像改名
  const handleRenameImage = async (imageId) => {
    if (!newFilename) {
      showErrorMessage('请输入新文件名');
      return;
    }

    try {
      const response = await renameImage(imageId, newFilename);
      if (response.success) {
        // 更新图像列表中的文件名
        setImages(images.map(image =>
          image.id === imageId ? { ...image, filename: response.data.filename } : image
        ));
        setEditingImageId(null); // 隐藏输入框
        setNewFilename(''); // 清空输入框
        showSuccessMessage('改名成功');
      } else {
        // 处理 response.success 为 false 的情况
        showErrorMessage(response.message || '图像改名失败');
      }
    } catch (error) {
      showErrorMessage(error.message || '图像改名失败');
    }
  };

  // 显示文件名输入框
  const showRenameInput = (imageId) => {
    setEditingImageId(imageId);
    setNewFilename(''); // 清空输入框
  };

  return (
    <div className={styles.rayImageManagementContainer}>
      <h2>射线图像管理</h2>

      {/* 上传图像表单 */}
      <div className={styles.uploadImageForm}>
        <h3>上传新图像</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setNewImage(e.target.files[0])}
          ref={fileInputRef}  // 引用文件输入框
        />
        <button onClick={handleImageUpload}>上传图像</button>
      </div>

      {/* 图像列表 */}
      <div className={styles.imageList}>
        <h3>已上传图像</h3>
        <table>
          <thead>
            <tr>
              <th>图像预览</th>
              <th>文件名</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {images.map(image => (
              <tr key={image.id}>
                <td>
                  <img
                    src={`http://localhost:5000/uploads/${image.filename}`}
                    alt="Image Preview"
                    style={{ width: '50px', height: '50px' }}
                  />
                </td>
                <td>{image.filename}</td>
                <td>
                  <div className={styles.actionButtons}>
                    {editingImageId === image.id ? (
                      <>
                        <input
                          type="text"
                          placeholder="新文件名"
                          value={newFilename}
                          onChange={(e) => setNewFilename(e.target.value)}
                          className={styles.renameInput}
                        />
                        <button
                          onClick={() => handleRenameImage(image.id)}
                          className={styles.confirmButton}
                        >
                          确认
                        </button>
                        <button
                          onClick={() => setEditingImageId(null)}
                          className={styles.cancelButton}
                        >
                          取消
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => showRenameInput(image.id)}
                        className={styles.renameButton}
                      >
                        重命名
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className={styles.deleteButton}
                    >
                      删除
                    </button>
                    <Link to={`/view-image/${image.id}`}>查看详情</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RayImageManagement;