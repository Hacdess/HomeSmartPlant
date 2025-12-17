import z from "zod";
import { JwtPayload } from "jsonwebtoken";

export const SignUpSchema = z
  .object({
    full_name: z.string().min(2, "Họ tên phải có ít nhất 2 kí tự"),
    user_name: z
      .string()
      .min(2, "Username phải có ít nhất 2 ký tự")
      .regex(/^[a-zA-Z0-9_]+$/, "Username chỉ được chứa chữ, số và dấu gạch dưới"),
    email: z.string().email("Email không hợp lệ"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[a-zA-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ cái")
      .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 số")
      .regex(/[^a-zA-Z0-9]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@, #, !, ...)"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
      message: "Mật khẩu nhập lại không khớp",
      path: ["confirmPassword"]
  });

export type SignUpRequest = z.infer<typeof SignUpSchema>;

export const SignInSchema = z
  .object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })

export type SignInRequest = z.infer<typeof SignInSchema>;

export interface MyTokenPayload extends JwtPayload {
  user_id: string;
  user_name: string;
  email: string;
  // thêm các field khác nếu bạn có nhét vào
}