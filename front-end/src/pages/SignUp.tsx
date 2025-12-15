import { Link } from "react-router-dom";
import PageLayout from "../layout/PageLayout";
import { useEffect, useReducer } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { type RegisterRequest } from "../types/auth.type";
import { Leaf } from "lucide-react";

const schema = z
  .object({
    full_name: z.string().min(2, "Họ tên phải có ít nhất 2 kí tự"),
    user_name: z
      .string()
      .min(3, "Username phải có ít nhất 3 ký tự")
      .regex(/^[a-zA-Z0-9_]+$/, "Username chỉ được chứa chữ, số và dấu gạch dưới"),
    email: z.string().email("Email không hợp lệ"),
    password: z
      .string()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
      .regex(/[a-zA-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ cái")
      .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 số")
      .regex(/[^a-zA-Z0-9]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@, #, !, ...)"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
      message: "Mật khẩu nhập lại không khớp",
      path: ["confirmPassword"]
  });

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (formData: RegisterRequest) => {
    setIsLoading(true);
    setServerError("");
    setSuccessMsg("");

    try {
      // Gọi API Backend
      const payload = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        user_name: formData.user_name
      }

      const response = await fetch('/api/auth/signup', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Có lỗi xảy ra từ phía Server")
      
      if (data.isSuccess) {
        setSuccessMsg(data.message);
        reset();
      }
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError("Không thể kết nối đến máy chủ");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Đăng Ký Tài Khoản | Smart Plant";
  }, []);

  // Helper để render input field cho gọn code
  const renderInput = (id, label, type, placeholder) => (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...register(id)}
        className={`w-full bg-background px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors duration-200
          ${errors[id] 
            ? 'border-red-500 focus:ring-red-200 focus:border-red-500' 
            : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
          }
        `}
      />
      {errors[id] && (
        <p className="mt-1 text-xs text-red-500 italic">
          {errors[id]?.message}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col gap-10 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center">
        <Leaf size="35" className="text-primary text-font"/>
        <h2 className="text-3xl font-bold text-primary">
          SmartPlant
        </h2>
      </div>
      <div className="max-w-md w-full space-y-8 bg-background p-8 rounded-xl shadow-lg border border-gray-100">
        
        <div className="flex flex-col items-center">
          <h2>Đăng ký</h2>
          <p className="mt-2 text-sm text-gray-600">
            Create a new account to manage IoT devices
          </p>
        </div>

        {/* Thông báo Server */}
        {serverError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}
        
        {successMsg && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <p className="text-sm text-green-700">{successMsg}</p>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-2" onSubmit={handleSubmit(onSubmit)}>
          
          {renderInput("full_name", "Fullname", "text", "Nguyễn Văn A")}
          
          {renderInput("user_name", "Username", "text", "nguyenvana")}
          
          {renderInput("email", "Email", "email", "example@gmail.com")}
          
          {renderInput("password", "Password", "password", "******")}
          
          {renderInput("confirmPassword", "Confirm password", "password", "******")}

          {/* Button Submit */}
          <Link to={"/"}>
            <button
              type="button"
              className=""
            >
              Back
            </button>
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white 
              ${isLoading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg'
              } transition-all duration-200 ease-in-out mt-6`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </span>
            ) : (
              "Đăng Ký Ngay"
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
              Đăng nhập tại đây
            </a>
          </p>
        </div>

      </div>
    </div>
  );
};