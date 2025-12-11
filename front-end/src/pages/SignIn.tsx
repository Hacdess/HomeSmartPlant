import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageLayout from "../layouts/PageLayout";
import { useState } from "react";

const SignIn = () => {
  const { username, login } = useAuth();
  const [name, setName] = useState("");

  if (username) return <Navigate to="/pages/dashboard" />;

  return (
    <PageLayout title="Sign In">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 mb-4 w-64"
        placeholder="Nhập username"
      />
      <button
        onClick={() => login(name)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Đăng nhập
      </button>

      <p className="mt-3">
        Chưa có tài khoản?{" "}
        <Link className="text-blue-600" to="/pages/SignUp">
          Đăng ký
        </Link>
      </p>
    </PageLayout>
  );
};
export default SignIn;
