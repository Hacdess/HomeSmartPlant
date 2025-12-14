import { register } from "module";
import { supabase } from "../config/supabase";
import { successResponse, errorResponse, ApiResponse } from "../utils/response";
import { Request, Response } from "express";
import { error } from "console";
import { AuthServices } from "../services/auth_services";
import { RegisterRequest, LoginRequest } from "../interface/auth";

export const AuthControllers = {
  signUp: async (req: Request, res: Response) => {
    try {
      const { email, password, full_name, user_name } = req.body as RegisterRequest;

      if (!email || !password || !full_name || !user_name)
        return res.status(400).json(errorResponse("Vui lòng điền đầy đủ thông tin"));

      const result = await AuthServices.signUp(email, password, full_name, user_name);

      res.status(result.isSuccess ? 201 : 400).json(result);
    
    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }
  }
}