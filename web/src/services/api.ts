const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

const getUserId = (): string => localStorage.getItem("userId") || "1";

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const apiClient = {
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": getUserId(),
      },
    });

    if (!response.ok) {
      const message =
        response.statusText || `Request failed with status ${response.status}`;
      throw new ApiError(message, response.status);
    }

    return response.json() as Promise<T>;
  },

  async post<T, D = unknown>(path: string, data: D): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": getUserId(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new ApiError(
        (errorBody as { error?: string }).error || response.statusText,
        response.status,
      );
    }

    return response.json() as Promise<T>;
  },
};

export { ApiError };
