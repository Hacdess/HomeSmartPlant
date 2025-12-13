// RENDER CÁI NAVBAR Ở TRÊN CÙNG
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LeafIcon, Bell, BellOff } from 'lucide-react';

const TopNavbar = () => {
    const { username } = useAuth();

    return (
        <div className="w-full bg-background border-border border-b shadow p-4 text-foreground flex justify-between items-center">
            {/* Logo */}
            <Link to="/">
            <div className="flex items-center gap-2">
                <LeafIcon className="text-primary" />
                <h1 className="text-font text-xl text-primary"> SmartPlant</h1>
            </div>
                
            </Link>

            <div className="flex items-center gap-4">
                {/* khi chưa signin */}
                {!username && (
                    <>
                        <Link to="/pages/SignIn" className="text-muted-foreground hover:text-green-600">
                            Đăng nhập
                        </Link>
                        <Link to="/pages/SignUp" className="text-foreground bg-green-600 px-4 py-2 rounded hover:bg-green-700">
                            Đăng ký
                        </Link>
                    </>
                )}

                {/* khi đã signin */}
                {/* notification bell icon */}
                {username && (
                    <button className="relative">
                        <Bell className="text-foreground" />
                    </button>
                )}
                {username && (
                    <Link to="/pages/Profile" className="text-foreground hover:text-green-600">
                        {username}
                    </Link>
                )}
            </div>
        </div>
    );
};

export default TopNavbar;