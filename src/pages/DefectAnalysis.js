// src/pages/DefectAnalysis.js
import React, { useEffect, useState, useContext } from 'react';
import { GlobalMessageContext } from '../context/GlobalMessageContext';
import { getDetectionResults, generateReport, deleteDetectionResult } from '../services/api.ts';  // 后端API请求
import { Link } from 'react-router-dom';
import { singleConfirm, doubleConfirm } from '../components/Confirmations';
import styles from '../styles/DefectAnalysis.module.css';

const DefectAnalysis = () => {
  const [detectionResults, setDetectionResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [remark, setRemark] = useState('');
  const [fileName, setFileName] = useState(''); // 报告文件名
  const [errorMessage, setErrorMessage] = useState('');
  const [isBoxesVisible, setIsBoxesVisible] = useState(false); // 控制检测框信息的可见性
  const { showSuccessMessage, showErrorMessage } = useContext(GlobalMessageContext);

  // 新增的时间范围和统计相关状态
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState(null);

  // 弹窗显示控制
  const [showPopup, setShowPopup] = useState(false);

  // 获取检测结果列表
  useEffect(() => {
    const fetchDetectionResults = async () => {
      try {
        const response = await getDetectionResults();
        if (response.success) {
          setDetectionResults(response.data);
        }
      } catch (error) {
        showErrorMessage('加载检测结果失败');
      }
    };
    fetchDetectionResults();
  }, []);

  // 选择检测结果
  const handleResultSelect = (result) => {
    setSelectedResult(result);
    setRemark(result.detect.remark || ''); // 如果有备注就预填备注
    setIsBoxesVisible(false); // 切换检测结果时默认折叠

    // 从图片路径中提取图片名字，并设置为报告名的默认值
    const imageName = result.detect.resultImage.split('/').pop(); // 获取图片文件名
    setFileName(imageName.replace(/\.[^/.]+$/, "")); // 去掉文件扩展名
  };

  // 生成检测报告
  const handleGenerateReport = async () => {
    if (!selectedResult) {
      showErrorMessage('请先选择一个检测结果');
      return;
    }

    if (!fileName.trim()) {
      showErrorMessage('请输入报告文件名');
      return;
    }

    try {
      const response = await generateReport(selectedResult.id, fileName, remark);
      if (response.success) {
        //setShowPopup(true); // 显示弹窗
        showSuccessMessage('报告生成成功');
      }
    } catch (error) {
      showErrorMessage('报告生成失败');
    }
  };

  // 删除检测结果
  const handleDeleteResult = async (id) => {
    try {
      // 触发二次确认弹窗
      singleConfirm(
        {
          title: '删除检测结果',
          content: '您确定要删除此检测结果吗？',
          okText: '删除',
          cancelText: '取消',
        },
        async () => {
          const response = await deleteDetectionResult(id);
          if (response.success) {
            setDetectionResults(detectionResults.filter(result => result.id !== id));
            showSuccessMessage('删除检测结果成功');
          }
        }
      );
    } catch (error) {
      showErrorMessage('删除检测结果失败');
    }
  };

  // 计算时间范围内的检测统计信息
  const handleGenerateStats = () => {
    if (!startDate || !endDate) {
      showErrorMessage('请选择开始时间和结束时间');
      return;
    }

    const filteredResults = detectionResults.filter((result) => {
      const resultTime = new Date(result.time);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // 设置为当天的开始时间 00:00:00
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // 设置为当天的结束时间 23:59:59.999

      return resultTime >= start && resultTime <= end;
    });


    if (filteredResults.length === 0) {
      // 如果没有检测结果，清空统计信息并显示空内容
      setStats({ totalDetections: 0, defectSummary: [] });
      setErrorMessage('');
      return;
    }

    const totalDetections = filteredResults.length;
    const defectStats = {};
    let totalDefects = 0; // 总缺陷数量

    filteredResults.forEach((result) => {
      result.detect.boxes.forEach((box) => {
        if (box.confidence >= 0.5) {  // 假设置信度大于等于0.5为问题
          const defectType = box.class;
          totalDefects += 1; // 每检测到一个缺陷，totalDefects加1
          if (defectStats[defectType]) {
            defectStats[defectType].count += 1;
          } else {
            defectStats[defectType] = { count: 1 };
          }
        }
      });
    });

    // 如果没有缺陷
    if (totalDefects === 0) {
      setStats({ totalDetections: 0, defectSummary: [] });
      setErrorMessage('');
      return;
    }

    const defectSummary = Object.keys(defectStats).map((defectType) => {
      const count = defectStats[defectType].count;
      const percentage = ((count / totalDefects) * 100).toFixed(2);  // 占比改为数量对总缺陷数的比
      return { defectType, count, percentage };
    });

    setStats({
      totalDetections,
      defectSummary,
    });
    setErrorMessage('');
  };


  // 关闭弹窗
  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className={styles.defectAnalysisContainer}>
      <h2>缺陷分析与报告生成</h2>
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      {/* 时间范围选择和统计结果部分 */}
      <div className={styles.statsContainer}>
        <div className={styles.timeRange}>
          {/* 第一行：选择时间范围文字 */}
          <h3>缺陷信息统计</h3>

          {/* 第二行：时间选择框 */}
          <div className={styles.inputs}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>至</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button className={styles.generateStatsButton} onClick={handleGenerateStats}>
              统计
            </button>
          </div>
        </div>

        {/* 显示统计结果 */}
        {stats && (
          <div className={styles.statsResults}>
            <h4>统计结果</h4>
            <p>总检测次数: {stats.totalDetections}</p>
            {stats.defectSummary.length > 0 ? (
              <ul>
                {stats.defectSummary.map(({ defectType, count, percentage }) => (
                  <li key={defectType}>
                    <p>缺陷类型: {defectType}</p>
                    <p>数量: {count}</p>
                    <p>占比: {percentage}%</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>所选时间段内没有检测到缺陷</p>
            )}
          </div>
        )}
      </div>

      {/* 检测结果列表 */}
      <div className={styles.detectionResults}>
        <h3>检测结果列表</h3>
        <ul>
          {detectionResults.map(result => (
            <li key={result.id}>
              <span onClick={() => handleResultSelect(result)}>{result.detect.resultImage}</span>
              <button onClick={() => handleDeleteResult(result.id)}>删除</button>
            </li>
          ))}
        </ul>
      </div>

      {/* 选择的检测结果 */}
      {selectedResult && (
        <div className={styles.selectedResult}>
          <h4>选中的检测结果</h4>
          <img
            src={`http://localhost:5000/uploads/${selectedResult.detect.resultImage}`}
            alt="Detection Result"
          />
          {/* 显示检测时间 */}
          <p className={styles.detectionTime}>
            检测时间: {selectedResult.time}
            {/* 例如 2024-12-23 06:24:20 */}
          </p>

          {/* 备注框 */}
          <div className={styles.inputGroup}>
            <label htmlFor="remark" className={styles.label}>备注:</label>
            <textarea
              id="remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="添加备注"
              rows="4"
              className={styles.input}
            ></textarea>
          </div>

          {/* 文件名输入框 */}
          <div className={styles.inputGroup}>
            <label htmlFor="fileName" className={styles.label}>报告文件名:</label>
            <input
              id="fileName"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="输入报告文件名"
              className={styles.input}
            />
          </div>

          {/* 检测框信息 */}
          <div className={styles.detectionBoxes}>
            <button
              className={styles.toggleButton}
              onClick={() => setIsBoxesVisible(!isBoxesVisible)}
            >
              {isBoxesVisible ? '隐藏检测框信息' : '展开检测框信息'}
            </button>
            {isBoxesVisible && (
              <ul>
                {selectedResult.detect.boxes.map((box, index) => (
                  <li key={index}>
                    <p>类别: {box.class}</p>
                    <p>置信度: {box.confidence.toFixed(2)}</p>
                    <p>坐标: ({box.x_min}, {box.y_min}) - ({box.x_max}, {box.y_max})</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* 生成报告按钮 */}
      {selectedResult && (
        <div className={styles.generateReport}>
          <button onClick={handleGenerateReport}>生成报告并保存</button>
        </div>
      )}

      {/* 弹窗 */}
      {showPopup && (
        <div className={styles.successPopupOverlay}>
          <div className={styles.successPopup}>
            <p>报告生成成功，请前往检测报告管理页面查看</p>
            <button onClick={closePopup}>好的</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DefectAnalysis;
