// src/components/Confirmations.js
import { Modal } from 'antd';

/**
 * 单次确认弹窗
 * @param {Object} options - 配置项
 * @param {string} options.title - 弹窗标题
 * @param {string} options.content - 弹窗内容
 * @param {string} options.okText - 确认按钮文本
 * @param {string} options.cancelText - 取消按钮文本
 * @param {Function} onConfirm - 确认后的回调函数
 */
export const singleConfirm = ({ title, content, okText, cancelText }, onConfirm) => {
  Modal.confirm({
    title: title || '确认操作',
    content: content || '您确定要执行此操作吗？',
    okText: okText || '确认',
    cancelText: cancelText || '取消',
    onOk: onConfirm,
  });
};

/**
 * 二次确认弹窗
 * @param {Object} options - 配置项
 * @param {string} options.title - 弹窗标题
 * @param {string} options.content - 弹窗内容
 * @param {string} options.okText - 确认按钮文本
 * @param {string} options.cancelText - 取消按钮文本
 * @param {Function} onConfirm - 确认后的回调函数
 */
export const doubleConfirm = ({ title, content, okText, cancelText }, onConfirm) => {
  Modal.confirm({
    title: title || '确认操作',
    content: content || '您确定要执行此操作吗？',
    okText: okText || '确认',
    cancelText: cancelText || '取消',
    onOk: () => {
      Modal.confirm({
        title: '再次确认',
        content: '请再次确认是否执行此操作？',
        okText: okText || '确认',
        cancelText: cancelText || '取消',
        onOk: onConfirm,
      });
    },
  });
};