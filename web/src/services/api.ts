const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getUserId = (): string => localStorage.getItem("userId") || "1";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiClient = {
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/api/v1${path}`, {
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": getUserId(),
      },
    });

    if (!response.ok) {
      throw new ApiError(response.statusText, response.status);
    }

    return response.json() as Promise<T>;
  },
};

export { ApiError };
