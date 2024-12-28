import os
from ultralytics import RTDETR

defect_classes = ['crazing', 'inclusion', 'patches', 'pitted_surface', 'rolled-in_scale', 'scratches']

def load_model(pt_path):
    """
    加载RTDETR预训练模型。
    :param pt_path: 模型权重文件的路径
    :return: 加载的RTDETR模型
    """
    if os.path.exists(pt_path):
        return RTDETR(pt_path)
    else:
        raise FileNotFoundError(f"Error: The file {pt_path} does not exist.")

def detect_image(model, image_path, save_path):
    """
    使用RTDETR模型检测图片中的物体，并返回检测框信息。
    :param model: 加载的RTDETR模型
    :param image_path: 输入图片路径
    :param save_path: 检测结果保存路径
    :return: 检测结果中的检测框列表
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Error: The file {image_path} does not exist.")

    # 检测并保存结果图像
    results = model(image_path)
    result = results[0]
    result.save(save_path)

    # 提取检测结果
    cls = result.boxes.cls.tolist()  # 类别编号
    conf = result.boxes.conf.tolist()  # 置信度
    xyxy = result.boxes.xyxy.tolist()  # 边界框坐标

    # 规范化边界框和类别信息
    boxes = []
    for i in range(len(cls)):
        x_min, y_min, x_max, y_max = xyxy[i]
        boxes.append({
            "x_min": round(x_min, 6),
            "y_min": round(y_min, 6),
            "x_max": round(x_max, 6),
            "y_max": round(y_max, 6),
            "class": defect_classes[int(cls[i])],
            "confidence": round(conf[i], 6)
        })

    return boxes
