from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os
import json
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


def generate_pdf_report(report_path, ori_img, detection_result, remark, app):
    """
    生成检测结果的 PDF 报告。

    :param report_path: str, 保存 PDF 文件的路径
    :param detection_result: DetectionResult, 检测结果对象
    :param remark: str, 备注信息
    """
    try:
        # 创建 PDF
        c = canvas.Canvas(report_path, pagesize=letter)
        width, height = letter

        # 设置标题
        pdfmetrics.registerFont(TTFont('cn', 'backend/SourceHanSansCN-Bold.ttf'))
        c.setFont("cn", 20)
        c.drawCentredString(width / 2.0, height - 50, "射线陷检测报告")

        # 添加分隔线
        c.setLineWidth(1)
        c.line(50, height - 60, width - 50, height - 60)

        # 添加基本信息
        c.setFont("cn", 12)
        text = [
            f"报告编号: {detection_result.id}",
            f"结果图像名: {detection_result.result_image}",
            f"备注: {remark}"
        ]

        y = height - 100
        for line in text:
            c.drawString(50, y, line)
            y -= 15

        # 添加空行
        y -= 20

        # 解析 boxes 字段
        boxes = json.loads(detection_result.boxes)
        c.setFont("cn", 14)
        c.drawString(50, y, "检测结果详细信息:")
        y -= 15

        # 显示每个框的详细信息
        c.setFont("cn", 10)
        for box in boxes:
            class_name = box.get("class", "N/A")
            confidence = box.get("confidence", "N/A")
            x_min = box.get("x_min", "N/A")
            y_min = box.get("y_min", "N/A")
            x_max = box.get("x_max", "N/A")
            y_max = box.get("y_max", "N/A")

            # 每个框的信息
            box_info = f"缺陷类别: {class_name}, 置信度: {confidence:.2f}, " \
                       f"边界框: ({x_min}, {y_min}) - ({x_max}, {y_max})"
            c.drawString(50, y, box_info)
            y -= 15
            if y < 100:  # 如果空间不足，增加一页
                c.showPage()
                y = height - 50

        # 备注一下详细信息的格式
        c.setFont("cn", 8)
        y -= 5
        c.drawString(50, y, "说明：边界框的坐标为 (x_min, y_min) - (x_max, y_max)，其中 (0, 0) 为左上角。")

        # 添加空行
        y -= 20

        # 如果需要，可以添加图像或其他信息
        result_image_path = os.path.join(app.config['UPLOAD_FOLDER_result'], detection_result.result_image)
        ori_image_path = ori_img.filepath
        if os.path.exists(ori_image_path):
            try:
                # 添加原始图像
                c.drawImage(ori_image_path, 50, y - 200, width=200, height=200, preserveAspectRatio=True, mask='auto')
                y -= 220
            except Exception as e:
                c.drawString(50, y, f"Failed to add original image: {str(e)}")
                y -= 20
        if os.path.exists(result_image_path):
            try:
                # 添加结果图像
                c.drawImage(result_image_path, 50, y - 200, width=200, height=200, preserveAspectRatio=True, mask='auto')
                y -= 220
            except Exception as e:
                c.drawString(50, y, f"Failed to add result image: {str(e)}")
                y -= 20
        # 完成 PDF 生成
        c.showPage()
        c.save()

        return True
    except Exception as e:
        print(f"Error generating PDF report: {str(e)}")
        return False
