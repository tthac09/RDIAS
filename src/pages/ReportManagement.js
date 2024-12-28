import React, { useEffect, useState, useContext } from 'react';
import { GlobalMessageContext } from '../context/GlobalMessageContext';
import { getReports, deleteReport } from '../services/api.ts'; // 后端API请求
import { Link } from 'react-router-dom';
import styles from '../styles/ReportManagement.module.css';
import { singleConfirm, doubleConfirm } from '../components/Confirmations';

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { showSuccessMessage, showErrorMessage } = useContext(GlobalMessageContext);

  // 获取报告列表
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await getReports();
        if (response.success) {
          setReports(response.data);
          setFilteredReports(response.data);
        }
      } catch (error) {
        showErrorMessage('加载报告失败');
      }
    };
    fetchReports();
  }, []);

  // 处理删除报告
  const handleDeleteReport = async (reportId) => {
    try {
      // 触发二次确认弹窗
      singleConfirm(
        {
          title: '删除报告',
          content: '您确定要删除此报告吗？',
          okText: '删除',
          cancelText: '取消',
        },
        async () => {
          const response = await deleteReport(reportId);
          if (response.success) {
            const updatedReports = reports.filter(report => report.id !== reportId);
            setReports(updatedReports);
            setFilteredReports(updatedReports);
            showSuccessMessage('删除报告成功');
          }
        }
      );
    } catch (error) {
      showErrorMessage('删除报告失败');
    }
  };

  // 点击搜索按钮后进行过滤
  const handleSearch = () => {
    let filtered = [...reports];

    // 按文件名过滤
    if (searchKeyword) {
      filtered = filtered.filter(report =>
        report.filename.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    // 按时间区间过滤
    if (startDate && endDate) {
      // 设置时间范围的开始和结束边界
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // 设置为当天开始时间 00:00:00
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // 设置为当天结束时间 23:59:59.999

      filtered = filtered.filter(report => {
        const createdAt = new Date(report.createdAt); // 转换为 Date 对象
        return createdAt >= start && createdAt <= end; // 检查是否在时间范围内
      });
    }


    setFilteredReports(filtered);
  };

  return (
    <div className={styles.reportManagementContainer}>
      <h2>检测报告管理</h2>
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      {/* 搜索功能 */}
      <div className={styles.searchContainer}>
        <div>
          <label htmlFor="filenameSearch">按文件名搜索:</label>
          <input
            type="text"
            id="filenameSearch"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="输入文件名关键词"
          />
        </div>
        <div>
          <label htmlFor="startDate">开始日期:</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="endDate">结束日期:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button onClick={handleSearch}>搜索</button>
      </div>

      {/* 报告列表 */}
      <div className={styles.reportList}>
        <h3>已生成检测报告</h3>
        <table>
          <thead>
            <tr>
              <th>报告标题</th>
              <th>报告文件</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map(report => (
              <tr key={report.id}>
                <td>{report.filename}</td>
                <td>
                  <a href={`http://localhost:5000/uploads/${report.filename}`} target="_blank" rel="noopener noreferrer">
                    {report.filename}
                  </a>
                </td>
                <td>{report.createdAt ? new Date(report.createdAt).toLocaleString() : '未知'}</td>
                <td>
                  <button onClick={() => handleDeleteReport(report.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportManagement;
