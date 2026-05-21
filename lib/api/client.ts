import axios, { AxiosRequestConfig } from "axios";

const API_BASE_URL = "/api/";

export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export class ApiError extends Error {
    constructor(message: string, public status: number, public data?: unknown) {
        super(message);
        this.name = "ApiError";
    }
}

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// ✅ Add interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        // throw if success is false
        if (response.data && response.data.success === false) {
            throw new ApiError(
                response.data.message || response.data.error || "Request failed",
                response.status,
                response.data
            );
        }
        return response;
    },
    (error) => {
        // handle HTTP errors (4xx, 5xx)
        const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Something went wrong";
        throw new ApiError(message, error.response?.status || 500, error.response?.data);
    }
);

export const api = {
    get: <T = unknown>(endpoint: string, config?: AxiosRequestConfig) =>
        axiosInstance.get<ApiResponse<T>>(endpoint, config).then((res) => res.data.data as T),
    post: <T = unknown>(endpoint: string, body?: unknown, config?: AxiosRequestConfig) =>
        axiosInstance.post<ApiResponse<T>>(endpoint, body, config).then((res) => res.data.data as T),
    put: <T = unknown>(endpoint: string, body?: unknown, config?: AxiosRequestConfig) =>
        axiosInstance.put<ApiResponse<T>>(endpoint, body, config).then((res) => res.data.data as T),
    patch: <T = unknown>(endpoint: string, body?: unknown, config?: AxiosRequestConfig) =>
        axiosInstance.patch<ApiResponse<T>>(endpoint, body, config).then((res) => res.data.data as T),
    delete: <T = unknown>(endpoint: string, config?: AxiosRequestConfig) =>
        axiosInstance.delete<ApiResponse<T>>(endpoint, config).then((res) => res.data.data as T),
};