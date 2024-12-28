# 射线检测缺陷智能识别分析软件

[[GitHub]](https://github.com/tthac09/RDIAS)

更多信息请见 README.md

## 快速开始

### 前置

使用 `conda create --name <env> --file requirements.txt` 命令准备 Python 环境。

使用 `npm install` 命令安装包。

### 配置数据库

在 `backend/app.py` 中设置 SQL 数据库的 url、端口、用户名和密码。

### 启用前端

使用以下命令运行前端：

```bash
npm start
```

### 启用后端

使用以下命令运行后端：

```bash
conda activate <env>
python backend/app.py
```