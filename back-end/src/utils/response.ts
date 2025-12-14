export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T | null;
  message: string;
  timestamp: string;
}

export const createResponse = (isSuccess: boolean, data: any = null, message: string) => ({
  isSuccess,
  data,
  message,
  timestamp: new Date().toISOString(),
});

export const successResponse = (data: any, message: string) => createResponse(true, data, message);

export const errorResponse = (message: any) => createResponse(false, null, message);