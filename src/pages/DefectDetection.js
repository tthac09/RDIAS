// src/pages/DefectDetection.js
import React, { useEffect, useState, useContext } from 'react';
import { GlobalMessageContext } from '../context/GlobalMessageContext';
import { getImages, detectDefects, saveDetectionResult, getModelList, search } from '../services/api.ts';
import styles from '../styles/DefectDetection.module.css';

const DefectDetection = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [modelList, setModelList] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const { showSuccessMessage, showErrorMessage } = useContext(GlobalMessageContext);

  // 获取图像列表
  useEffect(() => {
    const fetchImages = async () => {
      try {
        let response;
        if (searchKeyword) {
          response = await search('images', searchKeyword);
          if (response.success) {
            setImages(response.results);
          }
        } else {
          response = await getImages();
          if (response.success) {
            setImages(response.data);
          }
        }
      } catch (error) {
        showErrorMessage('加载图像失败');
      }
    };
    fetchImages();
  }, [searchKeyword]);

  // 获取模型列表
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const models = await getModelList();
        setModelList(models.data);
      } catch (error) {
        showErrorMessage('加载模型列表失败');
      }
    };
    fetchModels();
  }, []);

  const handleImageSelect = (image) => {
    setSelectedImage(image);
    setDetectionResult(null);
  };

  const handleModelSelect = (e) => {
    setSelectedModel(e.target.value);
  };

  const handleStartDetection = async () => {
    if (!selectedImage) {
      showErrorMessage('请先选择一张图像！');
      return;
    }

    if (!selectedModel) {
      showErrorMessage('请先选择一个模型！');
      return;
    }

    setLoading(true);

    try {
      const response = await detectDefects(selectedImage.id, selectedModel);
      if (response.success) {
        setDetectionResult(response.data);
        showSuccessMessage('检测成功！');
      } else {
        showErrorMessage('检测失败，请重试！');
      }
    } catch (error) {
      showErrorMessage('检测失败，请重试！');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDetection = async () => {
    if (!detectionResult) {
      showErrorMessage('没有检测结果可保存');
      return;
    }

    try {
      const response = await saveDetectionResult(selectedImage.id, detectionResult);
      if (response.success) {
        showSuccessMessage('保存检测结果成功');
      }
    } catch (error) {
      showErrorMessage('保存检测结果失败');
    }
  };

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  return (
    <div className={styles.defectDetectionContainer}>
      <h2>缺陷检测</h2>

      {/* 选择图像 */}
      <div className={styles.selectImage}>
        <h3>选择待检测图像</h3>
        <input
          type="text"
          placeholder="在此处键入图像名关键字..."
          value={searchKeyword}
          onChange={handleSearchChange}
        />
        <select onChange={(e) => handleImageSelect(images.find(img => img.id.toString() === e.target.value))}>
          <option value="">请选择图像</option>
          {images.map(image => (
            <option key={image.id} value={image.id}>
              {image.filename}
            </option>
          ))}
        </select>
      </div>

      {/* 选择模型 */}
      <div className={styles.selectModel}>
        <h3>选择检测模型</h3>
        <select onChange={handleModelSelect}>
          <option value="">请选择模型</option>
          {modelList.map(model => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>

      {/* 显示选中的图像 */}
      {selectedImage && (
        <div className={styles.imagePreview}>
          <h4>选中的图像</h4>
          <img
            src={`http://localhost:5000/uploads/${selectedImage.filename}`}
            alt="Selected"
          />
        </div>
      )}

      {/* 开始缺陷检测按钮 */}
      <div className={styles.startDetection}>
        <button onClick={handleStartDetection}>开始识别</button>
      </div>

      {/* 显示检测结果 */}
      {detectionResult && (
        <div className={styles.detectionResult}>
          <h3>检测结果</h3>
          <img
            src={`http://localhost:5000/uploads/${detectionResult.resultImage}`}
            alt="Detection Result"
          />
        </div>
      )}

      {/* 保存检测结果 */}
      {detectionResult && (
        <div className={styles.saveResult}>
          <button onClick={handleSaveDetection}>保存结果</button>
        </div>
      )}

      {/* 正在检测的弹窗 */}
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingPopup}>
            <p>正在检测，请稍等...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DefectDetection;