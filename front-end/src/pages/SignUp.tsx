import { Link } from "react-router-dom";
import PageLayout from "../layouts/PageLayout";

const SignUp = () => {
  return (
    <PageLayout title="Sign Up">
      <p>Form đăng ký...</p>
      <p className="mt-3">
        Đã có tài khoản?{" "}
        <Link className="text-green underline hover:text-green-200" to="/pages/SignIn">
          Đăng nhập
        </Link>
      </p>
    </PageLayout>
  );
};
export default SignUp;
