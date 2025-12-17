import { errorResponse, successResponse } from "../utils/response";
import { Request, Response } from "express";
import { AuthServices } from "../services/auth_services";
import { SignUpSchema, SignInSchema } from "../types/auth";
import z, { ZodError } from "zod";
import UserServices from "../services/user_services";
import { error } from "console";
import { LogServices, type supabaseLog } from "../services/log_services";
import { supabase } from "../config/supabase";

export const AuthControllers = {
  signUp: async (req: Request, res: Response) => {
    try {
      const { email, phone, password, full_name, user_name } = SignUpSchema.parse(req.body);

      const existingUser = await UserServices.findByIdentity(email, user_name, phone);

      if (existingUser) {
        if (existingUser.data?.email === email)
          return res.status(409).json(errorResponse("Email existed"));
        if (existingUser.data?.user_name === user_name)
          return res.status(409).json(errorResponse("Username existed"));
        if (existingUser.data?.phone)
          return res.status(409).json(errorResponse("Phpne existed"));
      }

      const encryptedPassword = await AuthServices.hashPassword(password);

      const userPayload = {
        full_name: full_name,
        user_name: user_name,
        email: email,
        phone: phone,
        password: encryptedPassword
      }

      const result = await UserServices.create(userPayload);

      if (result.error) throw error

      res.status(201).json(successResponse(result.data, "Signed up successfully"));
    
    } catch(e: any) {
      if (e instanceof z.ZodError) {
        const messages = e.issues.map((issue) => issue.message).join(", ");
        return res.status(400).json(errorResponse(messages));
      }
      return res.status(500).json(errorResponse(e.message));
    }
  },

  signIn: async(req: Request, res: Response) => {
    try {
      const { email, password } = SignInSchema.parse(req.body);

      const existingUser = await UserServices.findByEmail(email);
      
      if (!existingUser || !existingUser.data) return res.status(404).json(errorResponse("Email not found"));

      const isValidated = await AuthServices.validatePassword(password, existingUser.data.password);
      
      if (!isValidated) return res.status(401).json(errorResponse("Invalid password"));

      const payload = {
        user_id: existingUser.data.user_id,
        user_name: existingUser.data.user_name,
        email: existingUser.data.email
      }
      const token = await AuthServices.generateToken(payload)

      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true, // Quan trọng: JS không đọc được (chống XSS)
        secure: isProduction, // Production bắt buộc dùng HTTPS
        sameSite: 'strict' as const, // Chống CSRF (dùng 'lax' nếu redirect từ web khác)
      };

      res.cookie('token', token, {
        ...cookieOptions,
        maxAge: 3600 * 1000,
      });

      const log: supabaseLog = {
        user_id: payload.user_id,
        type: "AUTHENTICATE",
        content: "User signed in"
      }

      await LogServices.writeLog(log);

      return res.status(200).json(successResponse(payload, "Signed in successfully"));

    } catch(e: any) {
      if (e instanceof ZodError) {
        const messages = e.issues.map((issue) => issue.message).join(", ");
        return res.status(400).json(errorResponse(messages));
      }
      return res.status(500).json(errorResponse(e.message));
    }
  },

  getUser: async(req: Request, res: Response) => {
    try {
      const id = res.locals.user.user_id;
      if (!id) return res.status(404).json(errorResponse("No user stored"));

      const user = await UserServices.findByID(id);

      if (!user || !user.data) return res.status(404).json(errorResponse("User not found"));
      
      return res.status(200).json(successResponse(user.data, "User found"));

    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }
  }
}