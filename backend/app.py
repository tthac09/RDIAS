import pymysql
pymysql.install_as_MySQLdb()
from werkzeug.utils import secure_filename
import os
from flask import send_from_directory
from flask import Flask, request, jsonify
from flask_cors import CORS  # 用于跨域请求
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from sqlalchemy.sql import text
import json
from datetime import datetime
import os
import re
from flask import Flask, abort
from sqlalchemy import inspect
from sqlalchemy.exc import OperationalError
from werkzeug.utils import secure_filename
from object_detection_module import load_model, detect_image
from report import generate_pdf_report

# 初始化Flask应用
app = Flask(__name__)
CORS(app)  # 启用CORS，允许跨域请求

# 限制文件监控范围，仅监控项目根目录
app.config['TEMPLATES_AUTO_RELOAD'] = True
os.environ['FLASK_RUN_EXTRA_FILES'] = os.getcwd()
# 配置数据库连接
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:123456@localhost/rg'  # 指定数据库连接URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # 关闭对象修改追踪，减少内存消耗
# 配置上传文件夹
app.config['UPLOAD_FOLDER_image'] = os.path.abspath('uploads/image')
app.config['UPLOAD_FOLDER_result'] = os.path.abspath('uploads/result')
app.config['UPLOAD_FOLDER_model'] = os.path.abspath('uploads/model')
app.config['UPLOAD_FOLDER_report'] = os.path.abspath('uploads/report')

os.makedirs(app.config['UPLOAD_FOLDER_image'], exist_ok=True)  # 创建文件夹
os.makedirs(app.config['UPLOAD_FOLDER_result'], exist_ok=True)  # 创建文件夹
os.makedirs(app.config['UPLOAD_FOLDER_model'], exist_ok=True)  # 创建文件夹
os.makedirs(app.config['UPLOAD_FOLDER_report'], exist_ok=True)  # 创建文件夹
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# 用户模型
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False)

    def __init__(self, username, password, role):
        self.username = username
        self.password = password
        self.role = role

class Image(db.Model):
    __tablename__ = 'images'
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(255), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)  # 上传时间
    description = db.Column(db.String(255))  # 可选描述

    def __init__(self, filename, filepath, description=None):
        self.filename = filename
        self.filepath = filepath
        self.description = description

# 模型表
class Model(db.Model):
    __tablename__ = 'models'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)  # 自动递增ID
    name = db.Column(db.String(255), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)  # 上传时间

    def __init__(self, name):
        self.name = name

# 缺陷检测结果模型
class DetectionResult(db.Model):
    __tablename__ = 'detection_results'
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.DateTime, default=datetime.utcnow)  # 检测时间
    image_id = db.Column(db.Integer, db.ForeignKey('images.id'), nullable=False)  # 原图像在Image表中的ID
    model_id = db.Column(db.Integer, db.ForeignKey('models.id'), nullable=True)  # 使用的模型ID
    result_image = db.Column(db.String(255), nullable=False)  # 检测结果图像文件名称
    boxes = db.Column(db.Text, nullable=False)  # 检测框相关信息的JSON格式
    remark = db.Column(db.String(255), nullable=True)  # 可选备注

    def __init__(self, image_id, model_id, result_image, boxes, remark='No remarks yet'):
        self.image_id = image_id
        self.model_id = model_id
        self.result_image = result_image  # 结果图像文件名
        self.boxes = boxes
        self.remark = remark

# 用于检测报告的数据库模型
class DetectionReport(db.Model):
    __tablename__ = 'detection_reports'
    id = db.Column(db.Integer, primary_key=True)
    result_id = db.Column(db.Integer, db.ForeignKey('detection_results.id'), nullable=False)  # 检测结果的ID
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)  # 报告生成时间
    remark = db.Column(db.String(255), nullable=True)  # 可选备注
    report_path = db.Column(db.String(255), nullable=False)  # 报告文件路径

    def __init__(self, result_id, report_path, remark=None):
        self.result_id = result_id
        self.report_path = report_path
        self.remark = remark


# 添加初始化admin用户的功能
def init_db():
    # 使用应用上下文来执行数据库查询
    with app.app_context():
        db.create_all()  # 确保所有表格创建完毕
        # 检查是否已经存在用户
        user = User.query.first()
        
        if not user:  # 如果没有用户，创建一个初始的admin用户
            hashed_password = bcrypt.generate_password_hash('admin123').decode('utf-8')  # 默认密码是 'admin123'
            admin_user = User(username='admin', password=hashed_password, role='admin')
            db.session.add(admin_user)
            db.session.commit()
            print("Initial admin user created!")
        else:
            print("User already exists, no need to create an admin.")
        
def custom_secure_filename(filename):
    # 保留中文、字母、数字和常见符号
    return re.sub(r'[^\w\u4e00-\u9fa5\-.()]', '', filename)

@app.route('/api/search', methods=['GET'])
def search():
    table = request.args.get('table')
    keyword = request.args.get('keyword')

    if not table or not keyword:
        return jsonify({'success': False, 'message': '表名和关键词不能为空'}), 400

    # 根据表名动态选择模型
    if table == 'users':
        model = User
    elif table == 'images':
        model = Image
    elif table == 'models':
        model = Model
    elif table == 'detection_results':
        model = DetectionResult
    elif table == 'detection_reports':
        model = DetectionReport
    else:
        return jsonify({'success': False, 'message': '无效的表名'}), 400

    # 动态构建查询条件
    search_conditions = []
    for column in inspect(model).columns:
        if isinstance(column.type, (db.String, db.Text)):
            search_conditions.append(column.ilike(f'%{keyword}%'))

    # 执行查询
    try:
        results = model.query.filter(db.or_(*search_conditions)).all()
        results_data = [result.__dict__ for result in results]
        # 移除不必要的属性
        for result in results_data:
            result.pop('_sa_instance_state', None)
        return jsonify({'success': True, 'results': results_data})
    except OperationalError as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# 用户登录
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        # 检查用户名和密码是否存在
        if not username or not password:
            return jsonify({'success': False, 'message': 'Missing username or password'}), 401

        user = User.query.filter_by(username=username).first()

        if user and bcrypt.check_password_hash(user.password, password):  # 密码对比
            return jsonify({'success': True, 'user': username, 'role': user.role})
        else:
            return jsonify({'success': False, 'message': 'Invalid credentials'})

    except Exception as e:
        # 捕获任何其他异常，并返回 401 错误
        return jsonify({'success': False, 'message': str(e)}), 401

# 修改密码接口
@app.route('/api/change-password', methods=['POST'])
def change_password():
    try:
        data = request.get_json()
        username = data.get('username')
        old_password = data.get('oldPassword')
        new_password = data.get('newPassword')

        # 检查输入是否完整
        if not username or not old_password or not new_password:
            return jsonify({'success': False, 'message': '缺少必填字段'}), 400

        # 检查新密码复杂度
        if len(new_password) < 10:
            return jsonify({'success': False, 'message': '密码长度必须至少为10个字符'}), 400

        if not re.search(r'\d', new_password):  # 检查是否包含数字
            return jsonify({'success': False, 'message': '密码必须包含至少一个数字'}), 400

        if not re.search(r'[A-Z]', new_password):  # 检查是否包含大写字母
            return jsonify({'success': False, 'message': '密码必须包含至少一个大写字母'}), 400

        if not re.search(r'[a-z]', new_password):  # 检查是否包含小写字母
            return jsonify({'success': False, 'message': '密码必须包含至少一个小写字母'}), 400

        # 查找用户
        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({'success': False, 'message': '用户未找到'}), 404

        # 验证旧密码
        if not bcrypt.check_password_hash(user.password, old_password):
            return jsonify({'success': False, 'message': '旧密码无效'}), 401

        # 更新密码
        user.password = bcrypt.generate_password_hash(new_password)
        db.session.commit()

        return jsonify({'success': True, 'message': '密码更新成功'})

    except Exception as e:
        # 捕获任何异常，并返回 500 错误
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        userId = data.get('userId')
        newPassword = data.get('newPassword')

        # 检查输入是否完整
        if not userId or not newPassword:
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400

        # 查找用户
        user = User.query.filter_by(id=userId).first()
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        # 更新密码
        user.password = bcrypt.generate_password_hash(newPassword)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Password reset successfully'})

    except Exception as e:
        # 捕获任何异常，并返回 500 错误
        return jsonify({'success': False, 'message': str(e)}), 500

# 获取用户列表
@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    user_list = [{
        'id': user.id,
        'username': user.username,
        'role': user.role
    } for user in users]

    return jsonify({'success': True, 'data': user_list})

# 删除用户
@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    
    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': 'User not found'}), 404

@app.route('/api/users', methods=['POST'])
def add_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')

    # 检查用户名是否已存在
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'success': False, 'message': '用户名已存在，请更换'}), 400

    # 哈希密码
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # 创建新用户
    new_user = User(username=username, password=hashed_password, role=role)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'success': True, 'data': {'username': username, 'role': role}}), 201

# 更新用户
@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json()
    username = data.get('username')
    role = data.get('role')
    requester_username = request.args.get('requester_username')  # 从URL参数中获取发起用户名

    user = User.query.get(user_id)

    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    # 检查发起用户名是否与要修改的用户名相同
    if user.username == requester_username and role != user.role:
        return jsonify({'success': False, 'message': '禁止修改自身管理员角色！'}), 403

    # 更新用户信息
    user.username = username
    user.role = role
    db.session.commit()

    return jsonify({'success': True, 'data': {'id': user.id, 'username': user.username, 'role': user.role}})

@app.route('/api/images', methods=['GET'])
def get_images():
    images = Image.query.all()
    image_list = [{
        'id': image.id,
        'filename': image.filename,
        'filepath': image.filepath
    } for image in images]

    return jsonify({'success': True, 'data': image_list})

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    # 定义所有可能的上传文件夹
    upload_folders = [
        app.config['UPLOAD_FOLDER_image'],
        app.config['UPLOAD_FOLDER_result'],
        app.config['UPLOAD_FOLDER_model'],
        app.config['UPLOAD_FOLDER_report']
    ]
    
    # 遍历所有文件夹，查找文件
    for folder in upload_folders:
        file_path = os.path.join(folder, filename)
        #print(f"Checking file path: {file_path}", flush=True)
        if os.path.isfile(file_path):
            #print(f"File found: {file_path}", flush=True)
            return send_from_directory(folder, filename)
    
    # 如果文件未找到，返回 404 错误
    abort(404)

@app.route('/api/images/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'success': False, 'message': 'No file part'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        # 获取文件名并确保其安全
        filename = custom_secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER_image'], filename)

        # 如果文件已存在，重命名文件（添加一个唯一的后缀）
        if os.path.exists(filepath):
            base, ext = os.path.splitext(filename)
            counter = 1
            while os.path.exists(filepath):
                # 为文件名添加后缀，如 filename_1.jpg, filename_2.jpg
                filename = f"{base}_{counter}{ext}"
                filepath = os.path.join(app.config['UPLOAD_FOLDER_image'], filename)
                counter += 1

        # 保存文件
        file.save(filepath)

        # 保存图像信息到数据库
        new_image = Image(filename=filename, filepath=filepath)
        db.session.add(new_image)
        db.session.commit()

        return jsonify({'success': True, 'data': {'id': new_image.id, 'filename': filename, 'filepath': filepath}})
    else:
        return jsonify({'success': False, 'message': 'File type not allowed'}), 400


@app.route('/api/images/<int:image_id>', methods=['DELETE'])
def delete_image(image_id):
    image = Image.query.get(image_id)
    
    if image:
        try:
            # 检查文件是否存在
            if os.path.exists(image.filepath):
                # 删除文件
                os.remove(image.filepath)
            
            # 删除数据库记录
            db.session.delete(image)
            db.session.commit()
            return jsonify({'success': True})
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': str(e)}), 500
    else:
        return jsonify({'success': False, 'message': 'Image not found'}), 404

@app.route('/api/images/<int:id>', methods=['GET'])
def get_image_details(id):
    image = Image.query.get(id)
    
    if image:
        return jsonify({
            'success': True,
            'data': {
                'id': image.id,
                'filename': image.filename,
                'filepath': image.filepath,
                'uploadedAt': image.uploaded_at,  # 假设你有时间戳字段
                'description': image.description  # 假设你有描述字段
            }
        })
    else:
        return jsonify({'success': False, 'message': 'Image not found'}), 404

@app.route('/api/images/<int:image_id>/rename', methods=['PUT'])
def rename_image(image_id):
    # 获取请求体中的新文件名
    data = request.get_json()
    if not data or 'newFilename' not in data:
        return jsonify({'success': False, 'message': '请求中未提供新文件名，请检查请求体并确保包含 newFilename 字段'}), 400

    new_filename = data['newFilename']
    #print(new_filename, flush=True)

    # 查询图像是否存在
    image = Image.query.get(image_id)
    ext = os.path.splitext(image.filename)[1]
    new_filename += ext
    if not image:
        return jsonify({'success': False, 'message': f'未找到 ID 为 {image_id} 的图片，请检查图片是否存在'}), 404

    # 确保新文件名是安全的
    new_filename = custom_secure_filename(new_filename)

    # 构造新的文件路径
    new_filepath = os.path.join(app.config['UPLOAD_FOLDER_image'], new_filename)

    # 检查新文件名是否已存在
    if os.path.exists(new_filepath):
        return jsonify({'success': False, 'message': f'文件名 "{new_filename}" 已存在，请使用其他名称'}), 400

    try:
        # 重命名文件
        os.rename(image.filepath, new_filepath)

        # 更新数据库中的文件名和文件路径
        image.filename = new_filename
        image.filepath = new_filepath
        db.session.commit()

        return jsonify({
            'success': True,
            'message': '图片重命名成功',
            'data': {
                'id': image.id,
                'filename': image.filename,
                'filepath': image.filepath
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'重命名图片时发生错误：{str(e)}，请稍后重试或联系管理员'}), 500

@app.route('/api/models', methods=['GET'])
def get_model_list():
    models = Model.query.all()
    model_list = [{
        'id': model.id,
        'name': model.name,
        'uploadedAt': model.uploaded_at.strftime('%Y-%m-%d %H:%M:%S')  # 格式化时间
    } for model in models]

    return jsonify({'success': True, 'data': model_list, 'message': 'Models fetched successfully'})

@app.route('/api/uploadModel', methods=['POST'])
def upload_model():
    if 'model' not in request.files:
        return jsonify({'success': False, 'message': 'No file part'}), 400

    file = request.files['model']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No selected file'}), 400

    # 获取文件名
    filename = custom_secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER_model'], filename)

    # 如果文件已存在，重命名文件（添加一个唯一的后缀）
    base, ext = os.path.splitext(filename)
    counter = 1
    while os.path.exists(filepath):
        # 为文件名添加后缀，如 filename_1.ext, filename_2.ext
        filename = f"{base}_{counter}{ext}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER_model'], filename)
        counter += 1

    # 保存文件
    file.save(filepath)

    # 保存模型信息到数据库
    new_model = Model(name=filename)
    db.session.add(new_model)
    db.session.commit()

    return jsonify({
        'success': True,
        'data': {'id': new_model.id, 'name': new_model.name, 'uploadedAt': new_model.uploaded_at.strftime('%Y-%m-%d %H:%M:%S')},
        'message': 'Model uploaded successfully'
    })


@app.route('/api/deleteModel/<int:model_id>', methods=['DELETE'])
def delete_model(model_id):
    model = Model.query.get(model_id)
    
    if model:
        try:
            # 删除文件
            filepath = os.path.join(app.config['UPLOAD_FOLDER_model'], model.name)
            if os.path.exists(filepath):
                os.remove(filepath)
            # 删除数据库记录
            db.session.delete(model)
            db.session.commit()
            return jsonify({'success': True, 'message': 'Model deleted successfully'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': str(e)}), 500
    else:
        return jsonify({'success': False, 'message': 'Model not found'}), 404

@app.route('/api/detect', methods=['POST'])
def detect_defects():
    try:
        data = request.get_json()
        image_id = data.get('imageId')
        model_id = data.get('modelId')

        image = Image.query.get(image_id)
        model = Model.query.get(model_id)

        if not image or not model:
            return jsonify({'success': False, 'message': 'Invalid image or model ID'}), 400

        # 模拟检测结果（真实项目中应调用实际模型进行检测）
        model = load_model(pt_path=os.path.join(app.config['UPLOAD_FOLDER_model'], model.name))

        # 检测结果图片保存路径
        base, ext = os.path.splitext(image.filename)
        filename = f"{base}_result{ext}"
        save_path = os.path.join(app.config['UPLOAD_FOLDER_result'], filename)
        counter = 1
        while os.path.exists(save_path):
            # 为文件名添加后缀，如 filename_1.ext, filename_2.ext
            filename = f"{base}_result_{counter}{ext}"
            save_path = os.path.join(app.config['UPLOAD_FOLDER_result'], filename)
            counter += 1
        # 检测
        boxes = detect_image(model, image.filepath, save_path)

        return jsonify({
            'success': True,
            'data': {
                'resultImage': filename,
                'boxes': boxes
            }
        })
    except Exception as e:
        print(str(e), flush=True)
        raise

@app.route('/api/saveDetectionResult', methods=['POST'])
def save_detection_result():
    data = request.get_json()
    image_id = data.get('imageId')
    detection_result = data.get('detectionResult')

    # 验证输入数据
    if not detection_result or not image_id:
        return jsonify({'success': False, 'message': 'Invalid data'}), 400

    image = Image.query.get(image_id)
    if not image:
        return jsonify({'success': False, 'message': 'Image not found'}), 404

    result_image = detection_result.get('resultImage')  # 结果图像文件名
    boxes = detection_result.get('boxes')

    if not result_image or not boxes:
        return jsonify({'success': False, 'message': 'Invalid detection result format'}), 400

    # 将boxes转换为JSON字符串存储
    boxes_json = json.dumps(boxes)

    # 保存检测结果到数据库
    detection_result_entry = DetectionResult(
        image_id=image_id,
        model_id=None,  # 如果需要模型ID，请确保前端提供并在这里使用
        result_image=result_image,
        boxes=boxes_json
    )
    db.session.add(detection_result_entry)
    db.session.commit()

    # 返回符合格式的响应
    return jsonify({'success': True})

@app.route('/api/detectionResults', methods=['GET'])
def get_detection_results():
    results = DetectionResult.query.all()
    response = []
    for result in results:
        response.append({
            'id': result.id,
            'time': result.time.strftime('%Y-%m-%d %H:%M:%S'),
            'detect': {
                'resultImage': result.result_image,
                'boxes': eval(result.boxes),  # 将字符串解析为JSON对象
                'remark': result.remark
            }
        })
    return jsonify({'success': True, 'data': response})

@app.route('/api/deleteDetectionResult/<int:result_id>', methods=['DELETE'])
def delete_detection_result(result_id):
    result = DetectionResult.query.get(result_id)

    # 删除相关的检测结果文件和数据库记录
    file_path = os.path.join(app.config['UPLOAD_FOLDER_result'], result.result_image)
    if os.path.exists(file_path):
        os.remove(file_path)
    db.session.delete(result)
    db.session.commit()

    return jsonify({'success': True})

@app.route('/api/generateReport', methods=['POST'])
def generate_report():
    try:
        data = request.json
        result_id = data.get('resultId')
        remark = data.get('remark', 'No remarks.')
        file_name = data.get('name', '')  # 报告文件名

        # 获取检测结果
        detection_result = DetectionResult.query.get(result_id)
        if not detection_result:
            return jsonify({'success': False, 'message': 'Detection result not found'}), 404
        
        ori_img_id = detection_result.image_id
        ori_img = Image.query.get(ori_img_id)

        # 生成报告逻辑（例如保存PDF或其他报告文件）
        report_filename = file_name + ".pdf"
        report_path = os.path.join(app.config['UPLOAD_FOLDER_report'], report_filename)
        if os.path.exists(report_path):
            base, ext = os.path.splitext(report_filename)
            counter = 1
            while os.path.exists(report_path):
                # 为文件名添加后缀，如 filename_1.jpg, filename_2.jpg
                report_filename = f"{base}_{counter}{ext}"
                report_path = os.path.join(app.config['UPLOAD_FOLDER_report'], report_filename)
                counter += 1
        # 生成PDF报告文件并保存
        #print(report_path, flush=True)
        generate_pdf_report(report_path, ori_img, detection_result, remark, app)

        # 保存报告信息到数据库
        report = DetectionReport(result_id=result_id, report_path=report_path, remark=remark)
        db.session.add(report)
        db.session.commit()

        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/reports', methods=['GET'])
def get_reports():
    try:
        reports = DetectionReport.query.all()
        report_list = [{
            'id': report.id,
            'filename': os.path.basename(report.report_path),
            'createdAt': report.generated_at.strftime('%Y-%m-%d %H:%M:%S'),
        } for report in reports]
        
        return jsonify({'success': True, 'data': report_list})

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/reports/<int:report_id>', methods=['DELETE'])
def delete_report(report_id):
    report = DetectionReport.query.get(report_id)
    
    if report:
        try:
            # 删除报告文件
            if os.path.exists(report.report_path):
                os.remove(report.report_path)

            # 删除数据库中的记录
            db.session.delete(report)
            db.session.commit()
            
            return jsonify({'success': True})

        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': str(e)}), 500
    else:
        return jsonify({'success': False, 'message': 'Report not found'}), 404


# 启动Flask应用
if __name__ == '__main__':
    init_db()  # 初始化数据库及admin用户
    app.run(debug=True, host='0.0.0.0', port=5000)
