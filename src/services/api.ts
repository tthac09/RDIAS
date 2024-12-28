// src/services/api.ts
import axios from 'axios';

// 设置后端API的基础URL
const API_URL = 'http://localhost:5000/api';  // 根据你的后端地址修改

// 搜索请求接口的返回值类型
interface SearchResponse {
    success: boolean;
    results: any[]; // 根据实际返回的数据结构调整类型
    message?: string;
}
// 搜索请求
export const search = async (table: string, keyword: string): Promise<SearchResponse> => {
    try {
        const response = await axios.get<SearchResponse>(`${API_URL}/search`, {
            params: { table, keyword },
        });
        return response.data;
    } catch (error) {
        console.error('搜索失败', error);
        const errorMessage = error.response?.data?.message || '失败';
        throw new Error(errorMessage);
    }
};

// 登录请求接口的返回值类型
interface LoginResponse {
    success: boolean;
    user: string;
    role: string;
}
// 修改密码请求接口的返回值类型
interface ChangePasswordResponse {
    success: boolean;
    message: string;
}
// 登录请求
export const login = async (username: string, password: string): Promise<LoginResponse> => {
    try {
        const response = await axios.post<LoginResponse>(`${API_URL}/login`, { username, password });
        return response.data;
    } catch (error) {
        console.error('登录失败', error);
        const errorMessage = error.response?.data?.message || '登录失败';
        throw new Error(errorMessage);
    }
};
// 修改密码接口
export const changePassword = async (
    username: string,
    oldPassword: string,
    newPassword: string
): Promise<ChangePasswordResponse> => {
    try {
        const response = await axios.post<ChangePasswordResponse>(`${API_URL}/change-password`, {
            username,
            oldPassword,
            newPassword,
        });
        return response.data;
    } catch (error) {
        console.error('Change password failed', error);
        // 提取后端返回的错误信息
        const errorMessage = error.response?.data?.message || '密码修改失败';
        throw new Error(errorMessage);
    }
};
// 重置密码请求接口的返回值类型
interface ResetPasswordResponse {
    success: boolean;
    message: string;
}
// 重置密码接口
export const resetUserPassword = async (
    userId: string,
    newPassword: string
): Promise<ResetPasswordResponse> => {
    try {
        const response = await axios.post<ResetPasswordResponse>(`${API_URL}/reset-password`, {
            userId,
            newPassword,
        });
        return response.data;
    } catch (error) {
        console.error('Reset password failed', error);
        // 提取后端返回的错误信息
        const errorMessage = error.response?.data?.message || '重置密码失败';
        throw new Error(errorMessage);
    }
};

// 用户信息类型
interface User {
    id: number;
    username: string;
    role: string;
}
// 添加用户请求类型
interface AddUserRequest {
    username: string;
    password: string;
    role: string;
}
// 获取用户列表接口
export const getUsers = async (): Promise<{ success: boolean, data: User[] }> => {
    try {
        const response = await axios.get<{ success: boolean, data: User[] }>(`${API_URL}/users`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
// 删除用户接口
export const deleteUser = async (userId: number): Promise<{ success: boolean }> => {
    try {
        const response = await axios.delete<{ success: boolean }>(`${API_URL}/users/${userId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
// 添加用户接口
export const addUser = async (userData: AddUserRequest): Promise<{ success: boolean, data: User }> => {
    try {
        const response = await axios.post<{ success: boolean, data: User }>(`${API_URL}/users`, userData);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message); // 抛出具体的错误消息
        } else {
            throw new Error('添加用户失败'); // 默认错误消息
        }
    }
};
// 更新用户请求类型
interface UpdateUserRequest {
    username: string;
    role: string;
}
// 更新用户接口
export const updateUser = async (userId: number, userData: UpdateUserRequest, requesterUsername: string): Promise<{ success: boolean, data: User }> => {
    try {
        const response = await axios.put<{ success: boolean, data: User }>(
            `${API_URL}/users/${userId}?requester_username=${requesterUsername}`,
            userData
        );
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || '失败';
        throw new Error(errorMessage);
    }
};


// 获取图像列表的返回值类型
interface Image {
    id: number;
    filename: string;
    filepath: string;
}
// 上传图像的返回值类型
interface UploadedImage {
    id: number;
    filename: string;
    filepath: string;
}
// 删除图像的返回值类型
interface DeleteImageResponse {
    success: boolean;
    message?: string;
}
// 获取图像详情的返回值类型
interface ImageDetail {
    id: number;
    filename: string;
    filepath: string;
    uploadedAt?: string;  // 上传时间
    description?: string;  // 可选描述
}
// 获取图像列表请求
export const getImages = async (): Promise<{ success: boolean, data: Image[] }> => {
    try {
        const response = await axios.get<{ success: boolean, data: Image[] }>(`${API_URL}/images`);
        return response.data;
    } catch (error) {
        console.error('加载图像失败', error);
        throw error;
    }
};
// 上传图像请求
export const uploadImage = async (formData: FormData): Promise<{ success: boolean, data: UploadedImage }> => {
    try {
        const response = await axios.post<{ success: boolean, data: UploadedImage }>(
            `${API_URL}/images/upload`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    } catch (error) {
        console.error('上传图像失败', error);
        throw error;
    }
};
// 删除图像请求
export const deleteImage = async (imageId: number): Promise<DeleteImageResponse> => {
    try {
        const response = await axios.delete<DeleteImageResponse>(`${API_URL}/images/${imageId}`);
        return response.data;
    } catch (error) {
        console.error('删除图像失败', error);
        throw error;
    }
};
// 获取图像详情请求
export const getImageDetails = async (id: number): Promise<{ success: boolean, data: ImageDetail }> => {
    try {
        const response = await axios.get<{ success: boolean, data: ImageDetail }>(
            `${API_URL}/images/${id}`
        );
        return response.data;
    } catch (error) {
        console.error('加载图像详情失败', error);
        throw error;
    }
};
// 图像改名的返回值类型
interface RenameImageResponse {
    success: boolean;
    message?: string;
    data?: {
        id: number;
        filename: string;
        filepath: string;
    };
}
// 图像改名请求
export const renameImage = async (imageId: number, newFilename: string): Promise<RenameImageResponse> => {
    try {
        const response = await axios.put<RenameImageResponse>(
            `${API_URL}/images/${imageId}/rename`,
            { newFilename },
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        console.error('图像改名失败', error);
        const errorMessage = error.response?.data?.message || '错误';
        throw new Error(errorMessage);
    }
};

// 定义缺陷检测接口的返回值类型
interface DetectionResult {
    resultImage: string;  // 检测结果图像文件名
    boxes: {
        x_min: number;
        y_min: number;
        x_max: number;
        y_max: number;
        class: string;  // 检测框对应的类别
        confidence: number;  // 检测结果的置信度
    }[];
    remark?: string;  // 备注是可选的
}
interface DetectDefectsResponse {
    success: boolean;
    data: DetectionResult;
}
// 定义保存检测结果接口的返回值类型
interface SaveDetectionResultResponse {
    success: boolean;
}
// 开始缺陷检测
export const detectDefects = async (imageId: string, modelId: string): Promise<DetectDefectsResponse> => {
    try {
        const response = await axios.post<DetectDefectsResponse>(`${API_URL}/detect`, {
            imageId,
            modelId // 传递选中的模型 ID
        });
        return response.data;
    } catch (error) {
        console.error('检测失败', error);
        throw error;
    }
};
// 保存检测结果
export const saveDetectionResult = async (imageId: string, detectionResult: DetectionResult): Promise<SaveDetectionResultResponse> => {
    try {
        const response = await axios.post<SaveDetectionResultResponse>(`${API_URL}/saveDetectionResult`, {
            imageId,
            detectionResult,
        });
        return response.data;
    } catch (error) {
        console.error('保存检测结果失败', error);
        throw error;
    }
};

// 定义获取检测结果接口的返回值类型
interface DetectionResultv2 {
    id: number;
    time: string;  // 检测时间, strftime('%Y-%m-%d %H:%M:%S')
    detect: DetectionResult;
}
interface GetDetectionResultsResponse {
    success: boolean;
    data: DetectionResultv2[];
}
// 定义生成检测报告接口的返回值类型
interface GenerateReportResponse {
    success: boolean;
}
// 定义删除检测结果接口的返回值类型
interface DeleteDetectionResultResponse {
    success: boolean;
}
// 获取检测结果列表
export const getDetectionResults = async (): Promise<GetDetectionResultsResponse> => {
    try {
        const response = await axios.get<GetDetectionResultsResponse>(`${API_URL}/detectionResults`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
// 生成检测报告
export const generateReport = async (resultId: number, name: string, remark: string): Promise<GenerateReportResponse> => {
    try {
        const response = await axios.post<GenerateReportResponse>(`${API_URL}/generateReport`, { resultId, name, remark });
        return response.data;
    } catch (error) {
        throw error;
    }
};
// 删除检测结果
export const deleteDetectionResult = async (resultId: number): Promise<DeleteDetectionResultResponse> => {
    try {
        const response = await axios.delete<DeleteDetectionResultResponse>(`${API_URL}/deleteDetectionResult/${resultId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 获取模型列表返回值类型
interface Model {
    id: string;
    name: string;
    uploadedAt: string;
}
interface GetModelListResponse {
    success: boolean;
    data: Model[];
    message: string;
}
// 上传模型返回值类型
interface UploadModelResponse {
    success: boolean;
    data: {
        id: string;
        name: string;
        uploadedAt: string;
    };
    message: string;
}
// 删除模型返回值类型
interface DeleteModelResponse {
    success: boolean;
    message: string;
}
// 获取模型列表
export const getModelList = async (): Promise<GetModelListResponse> => {
    try {
        const response = await axios.get<GetModelListResponse>(`${API_URL}/models`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch model list', error);
        throw error;
    }
};
// 上传新模型
export const uploadModel = async (formData: FormData): Promise<UploadModelResponse> => {
    try {
        const response = await axios.post<UploadModelResponse>(`${API_URL}/uploadModel`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to upload model', error);
        throw error;
    }
};
// 删除模型
export const deleteModel = async (id: string): Promise<DeleteModelResponse> => {
    try {
        const response = await axios.delete<DeleteModelResponse>(`${API_URL}/deleteModel/${id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to delete model', error);
        throw error;
    }
};

// 获取报告列表的返回值类型
interface Report {
    id: number;
    filename: string;
    createdAt?: string;  // 可选创建时间
}
// 删除报告的返回值类型
interface DeleteReportResponse {
    success: boolean;
    message?: string;
}
// 获取报告列表请求
export const getReports = async (): Promise<{ success: boolean, data: Report[] }> => {
    try {
        const response = await axios.get<{ success: boolean, data: Report[] }>(`${API_URL}/reports`);
        return response.data;
    } catch (error) {
        console.error('加载报告失败', error);
        throw error;
    }
};
// 删除报告请求
export const deleteReport = async (reportId: number): Promise<DeleteReportResponse> => {
    try {
        const response = await axios.delete<DeleteReportResponse>(`${API_URL}/reports/${reportId}`);
        return response.data;
    } catch (error) {
        console.error('删除报告失败', error);
        throw error;
    }
};

