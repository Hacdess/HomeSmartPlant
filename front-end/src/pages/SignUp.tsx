import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Leaf } from "lucide-react";
import { SignUpSchema, type SignUpRequest } from "@shared/auth"
import InputField from "../components/Auth/InputFields";


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
    resolver: zodResolver(SignUpSchema),
  });

  const navigate = useNavigate();

  const onSubmit = async (formData: SignUpRequest) => {
    setIsLoading(true);
    setServerError("");
    setSuccessMsg("");

    try {
      // Gọi API Backend
      const payload = {
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
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

      if (!response.ok) throw new Error(data.message || "Server error")
      
      if (data.isSuccess) {
        setSuccessMsg(data.message);
        reset();
        navigate("/");
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


  return (
    <div className="min-h-screen flex flex-col gap-10 items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-primary/20">
      <div className="flex items-center gap-4">
        <Leaf size="35" className="text-primary text-font"/>
        <h2 className="text-3xl font-bold text-primary">
          SmartPlant
        </h2>
      </div>
      <div className="max-w-md w-full space-y-8 bg-background p-8 rounded-xl shadow-lg border border-gray-100">
        
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-semibold">Sign Up</h2>
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
          
          <InputField id="full_name" label="Fullname" type="text" placeholder="Nguyễn Văn A" register={register} errors={errors}/>
          <InputField id="user_name" label="Username" type="text" placeholder="nguyenvana" register={register} errors={errors}/>
          <InputField id="phone" label="Phone" type="tel" placeholder="+84 XX XXX XXXX" register={register} errors={errors}/>
          <InputField id="email" label="Email" type="email" placeholder="nguyenvana@gmail" register={register} errors={errors}/>
          <InputField id="password" label="Password" type="password" placeholder="******" register={register} errors={errors}/>
          <InputField id="confirmPassword" label="Confirm password" type="password" placeholder="******" register={register} errors={errors}/>          
          
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
                ? 'bg-green-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-md hover:shadow-lg'
              } transition-all duration-200 ease-in-out mt-6`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Sign Up Now"
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to={"/sign-in"} className="font-medium text-green-600 hover:text-green-500 hover:underline">
              Sign-in here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};