import { useNavigate } from "react-router-dom"; 
import { User, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

type UserProfile = { // back-end/src/types/database.typs.ts
  user_id: string;
  full_name: string;
  user_name: string;
  email: string;
  telegram_id: string;
  phone: string;
  created_at: string | null;
  updated_at: string | null;
};

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/auth/profile", {
        method: "GET",
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user profile");
      }

      if (data.isSuccess && data.data) {
        setUser(data.data);
      } else {
        throw new Error(data.message || "Failed to load profile");
      }
    } catch (e) {
      console.error("Error fetching user profile:", e);
      setError(e instanceof Error ? e.message : "Failed to load profile");
      // Redirect to sign-in if unauthorized
      if (e instanceof Error && (e.message.includes("401") || e.message.includes("Unauthorized"))) {
        navigate('/sign-in');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Profile - SmartPlant";
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 flex justify-center items-center min-h-[400px]">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
          <p className="text-destructive mb-4">{error || "Không thể tải thông tin người dùng"}</p>
          <button
            onClick={() => navigate('/sign-in')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
          >
            Đi tới Đăng nhập
          </button>
        </div>
      </div>
    );
  }

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
      console.error('Lỗi khi đăng xuất:', e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Tài khoản</h1>
      </div>

      {/* Personal Information Section */}
      <div className="bg-background border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Thông tin cá nhân</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Thông tin chi tiết tài khoản và cá nhân của bạn
        </p>

        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Họ và tên
            </label>
            <div className="bg-input text-foreground px-4 py-3 border border-border rounded-lg">
              {user.user_name || user.full_name}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Họ tên
            </label>
            <div className="bg-input text-foreground px-4 py-3 border border-border rounded-lg">
              {user.full_name}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tên đăng nhập
            </label>
            <div className="bg-input text-foreground px-4 py-3 border border-border rounded-lg">
              {user.user_name}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <div className="bg-input text-foreground px-4 py-3 border border-border rounded-lg">
              {user.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Telegram ID
            </label>
            <div className="bg-input text-foreground px-4 py-3 border border-border rounded-lg">
              {user.telegram_id}
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out Section */}
      <div className="bg-background border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <LogOut className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Đăng xuất</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Đăng xuất khỏi tài khoản để đảm bảo an toàn
        </p>

        <button
          onClick={handleLogout}
          className="bg-green-600 hover:bg-green-700 text-primary-foreground px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Profile;
