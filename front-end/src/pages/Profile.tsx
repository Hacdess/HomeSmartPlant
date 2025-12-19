import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { User, LogOut } from "lucide-react";
import { useEffect } from "react";
// import { create } from "node_modules/axios/index.d.cts";

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Profile - SmartPlant";
  }, []);

  if (!user) return <Navigate to="/" />;

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });

      const result = await res.json();
      if (res.ok && result.isSuccess) {
        navigate('/');
        setUser(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Account</h1>
      </div>

      {/* Personal Information Section */}
      <div className="bg-background border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Your account details and personal information here
        </p>

        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Fullname
            </label>
            <div className="bg-input text-foreground px-4 py-3 border border-border rounded-lg">
              {user.user_name || user.full_name}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <div className="bg-input text-foreground px-4 py-3 border border-border rounded-lg">
              {user.email}
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out Section */}
      <div className="bg-background border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <LogOut className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Sign Out</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Sign out from your account to ensure security
        </p>

        <button
          onClick={handleLogout}
          className="bg-green-600 hover:bg-green-700 text-primary-foreground px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
