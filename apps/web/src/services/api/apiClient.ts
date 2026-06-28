import axios from "axios"

// Base URL for the FastAPI backend API
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || "http://localhost:8000/") as string

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Response Interceptor to unpack the standardized StandardResponse wrappers
apiClient.interceptors.response.use(
  (response) => {
    const responseBody = response.data
    // If backend returns StandardResponse wrapper format, unpack data
    if (responseBody && typeof responseBody === "object" && "success" in responseBody) {
      if (responseBody.success) {
        return {
          ...response,
          data: responseBody.data,
        }
      } else {
        const errorMsg = responseBody.message || "API request execution failed."
        return Promise.reject(new Error(errorMsg))
      }
    }
    return response
  },
  (error) => {
    // Standardize error formats from server failures
    const responseData = error.response?.data
    if (responseData && typeof responseData === "object") {
      if (responseData.message) {
        return Promise.reject(new Error(responseData.message))
      }
      if (responseData.detail) {
        return Promise.reject(new Error(responseData.detail))
      }
    }
    return Promise.reject(error)
  }
)
