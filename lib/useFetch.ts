import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";
import { TokenData } from "@/types/api";

class ApiError extends Error {
  constructor(message: string, public status?: number, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

const tokenManager = {
  getTokens(): TokenData | null {
    const t = localStorage.getItem("tokens");
    return t ? JSON.parse(t) : null;
  },
  setTokens(tokens: TokenData) {
    localStorage.setItem("tokens", JSON.stringify(tokens));
  },
  clearTokens() {
    localStorage.removeItem("tokens");
  },
};

const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_EXTERNAL_API_BASE_URL || "",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

axiosInstance.interceptors.request.use((config) => {
  const tokens = tokenManager.getTokens();
  if (tokens?.access_token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${tokens.access_token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      const tokens = tokenManager.getTokens();
      if (tokens?.refresh_token) {
        originalRequest._retry = true;
        try {
          const refreshRes = await axiosInstance.post("/auth/refresh", {
            refresh_token: tokens.refresh_token,
          });

          const newTokens: TokenData = {
            access_token: refreshRes.data.access_token,
            refresh_token: refreshRes.data.refresh_token || tokens.refresh_token
          };

          tokenManager.setTokens(newTokens);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
          }

          return axiosInstance(originalRequest);
        } catch {
          tokenManager.clearTokens();
          window.location.href = "/login";
          return Promise.reject(new ApiError("Session expired. Please login again."));
        }
      }
    }

    return Promise.reject(error);
  }
);

export const apiCall = async <T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  options?: { params?: any; body?: any; headers?: Record<string, string> }
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const res = await axiosInstance.request<T>({
      url,
      method,
      params: options?.params,
      data: options?.body,
      headers: options?.headers,
    });
    return { data: res.data, error: null };
  } catch (err) {
    let errorMessage = "Unknown error";

    if (axios.isAxiosError(err)) {
      errorMessage =
        err.response?.data?.message ||
        err.response?.statusText ||
        err.message ||
        "Unknown error";
    }

    throw new Error(errorMessage);
  }
};