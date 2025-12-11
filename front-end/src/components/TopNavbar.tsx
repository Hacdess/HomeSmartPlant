// RENDER CÁI NAVBAR Ở TRÊN CÙNG
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const TopNavbar = () => {
    const { username } = useAuth();

    return (
        <div className="w-full bg-white shadow p-4 text-white flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="text-xl font-bold">
                <h1 className="text-xl font-bold text-green-600">SmartPlant</h1>
            </Link>

            <div className="flex items-center gap-4">
                {/* khi chưa signin */}
                {!username && (
                    <>
                        <Link to="/pages/SignIn" className="text-gray-600 hover:text-green-600">
                            Đăng nhập
                        </Link>
                        <Link to="/pages/SignUp" className="text-white bg-green-600 px-4 py-2 rounded hover:bg-green-700">
                            Đăng ký
                        </Link>
                    </>
                )}

                {/* khi đã signin */}
                {/* notification bell icon */}
                {username && (
                    <button className="relative">
                        <span className="material-icons text-gray-600">Notifications</span>
                    </button>
                )}
                {username && (
                    <Link to="/pages/Profile" className="text-gray-600 hover:text-green-600">
                        {username}
                    </Link>
                )}
            </div>
        </div>
    );
};

export default TopNavbar;