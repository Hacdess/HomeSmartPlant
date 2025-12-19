import { NextFunction } from "express"
import { Request, Response } from "express";
import { AuthServices } from "../services/auth_services";
import { errorResponse } from "../utils/response";
import { MyTokenPayload } from "../types/auth";

// Middleware kiểm tra đăng nhập
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token; 

    if (!token) {
      return res.status(401).json(errorResponse("Không có token"));
    }

    try {
    
      const payload:MyTokenPayload = await AuthServices.validateToken(token) as MyTokenPayload;

      if (!payload) throw new Error("Token: Payload không hợp lệ");

      res.locals.user = payload;
      res.locals.authenticated = true; // Lưu thông tin user để dùng ở bước sau

      next();
    } catch (err) {
      return res.status(403).json(errorResponse("Token không hợp lệ"));
    }
};