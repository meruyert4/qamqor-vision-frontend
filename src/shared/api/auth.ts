import { LoginRequest, LoginResponse, ApiError } from "../types/user";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: number;
}

const handleResponse = async <T>(
  response: Response
): Promise<ApiResponse<T>> => {
  const status = response.status;
  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return {
      status,
      error: {
        error: "Invalid response",
        message: "Server returned non-JSON response",
      },
    };
  }

  const data = await response.json();

  if (!response.ok) {
    return {
      status,
      error: data as ApiError,
    };
  }

  return {
    status,
    data: data as T,
  };
};

export const login = async (
  credentials: LoginRequest
): Promise<ApiResponse<LoginResponse>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    return await handleResponse<LoginResponse>(response);
  } catch (error) {
    let errorMessage = "Не удалось подключиться к серверу";
    
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      errorMessage = `Не удалось подключиться к серверу API (${API_BASE_URL}). Убедитесь, что сервер запущен и доступен.`;
    } else if (error instanceof Error) {
      errorMessage = `Ошибка сети: ${error.message}`;
    }
    
    return {
      status: 500,
      error: {
        error: "Network error",
        message: errorMessage,
      },
    };
  }
};

