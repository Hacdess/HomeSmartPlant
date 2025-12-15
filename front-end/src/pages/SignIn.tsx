import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageLayout from "../layout/PageLayout";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SignInRequest } from "../types/auth.type";

const schema = z
  .object({
    identifer: z.string().min(2, "Username or Email must be at least 2 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
  
export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const onSubmit = async (formData: SignInRequest) => {

  }

  // const { username, login } = useAuth();
  // const [name, setName] = useState("");

  // if (username) return <Navigate to="/pages/dashboard" />;

  // return (
  //     <input
  //       value={name}
  //       onChange={(e) => setName(e.target.value)}
  //       className="border p-2 mb-4 w-64"
  //       placeholder="Nhập username"
  //     />
  //     <button
  //       onClick={() => login(name)}
  //       className="bg-green-600 text-foreground px-4 py-2 rounded"
  //     >
  //       Đăng nhập
  //     </button>

  //     <p className="mt-3">
  //       Chưa có tài khoản?{" "}
  //       <Link className="text-green-600 underline" to="/pages/SignUp">
  //         Đăng ký
  //       </Link>
  //     </p>
  // );

  return(
    <></>
  )
};