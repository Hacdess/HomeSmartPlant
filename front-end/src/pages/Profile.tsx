import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageLayout from "../layouts/PageLayout";

const Profile = () => {
  const { username , logout } = useAuth();
  if (!username) return <Navigate to="/pages/SignIn" />;

  return (
    <PageLayout title="Profile">
      <p>User: {username}</p>

      <button
        onClick={() => logout()}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </PageLayout>
  );
};

export default Profile;
