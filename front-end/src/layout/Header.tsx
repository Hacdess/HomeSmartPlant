import { LeafIcon, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { set } from "zod";

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

      if (data.isSuccess) {
        setUser({
          full_name: data.data.user_id,
          user_name: data.data.user_name,
          email: data.data.email
        })
      }
    } catch(e) {
      console.error(e);
    }
  }

  useEffect(() => {
    fetchUser();
  }, [])

  const handleLogout = async () => {
    try {
      // const res = await fetch('/api/auth/logout', {
      //   method: 'POST',
      //   credentials: 'include',
      // });

      // const result = await res.json();
      // if (res.ok && result.isSuccess) {
        setUser(null);
        navigate('/');
      // }
    } catch (e) {
      console.error(e);
    }
  };

  return(
    <header className="flex flex-row justify-between mx-auto max-w-5xl p-4 sm:p-6 lg: p-8">
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