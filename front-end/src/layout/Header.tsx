import { LeafIcon, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

export default function Header() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()

  const fetchUser = async() => {
    try {
      const response = await fetch("/api/auth/profile", {
        method: "GET",
        headers: { 'Content-Type': 'application/json', },
      })

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Server error")
      
      console.log(data)
      if (data.isSuccess) {
        setUser({
          full_name: data.data.full_name,
          user_name: data.data.user_name,
          email: data.data.email,
          notify: data.data.notify,
          is_auto: data.data.is_auto,
          esp_id: data.data.esp_id,
        })
      }
    } catch(e) {
      console.error('Lỗi khi tải thông tin người dùng:', e);
    }
  }

  useEffect(() => {
    fetchUser();
  }, [])

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });

      const result = await res.json();
      if (res.ok && result.isSuccess) {
        setUser(null);
        navigate('/');
      }
    } catch (e) {
      console.error('Lỗi khi đăng xuất:', e);
    }
  };

  return(
    <header className="flex flex-row justify-between mx-auto p-4 border-b border-border ">
      <Link to={"/"} className="flex items-center gap-2">
        <LeafIcon className="text-primary" />
        <h1 className="text-font text-xl text-primary"> SmartPlant</h1>
      </Link>
      <div className="flex flex-row justify-center items-center gap-5">
        {user
          ? <>
            <Link to="/profile">
              <User/>
            </Link>
            <h2>{user.user_name}</h2>
            <button
              className="border p-2"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          </>
          : <>
            <Link to="sign-in" className="text-muted-foreground hover:text-green-600">
                Đăng nhập
            </Link>
            <Link to="/sign-up" className="text-foreground bg-green-600 px-4 py-2 rounded hover:bg-green-700">
                Đăng ký
            </Link>
          </>
        }
      </div>
    </header>
  )
}