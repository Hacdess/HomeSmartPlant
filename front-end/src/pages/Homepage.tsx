import PageLayout from "../layout/PageLayout";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { useEffect

 } from "react";
export default function Homepage()  {

  useEffect(() => {
    document.title = "Smart Plant";
  }, []);

  return (
    <div className="text-justify flex flex-col md:flex-row items-center gap-16 -mx-4 sm:-mx-6 lg:-mx-8 px-5">
      <div className="md:w-1/2 flex flex-col justify-center gap-6">
        <h1 className="text-4xl font-bold">Hệ thống tưới và chiếu sáng thông minh</h1>
        <h4 >Giám sát và điều khiển vườn cây của bạn từ xa. Tự động tưới nước, điều chỉnh ánh sáng và theo dõi sức khỏe cây trồng theo thời gian thực.</h4>
        <Link to="/dashboard" className="inline-block text-center bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition-colors w-max">
          Thử ngay
        </Link>
      </div>
      <div className="md:w-1/2">
        <img 
          src="/plants_homepage.jpg"
          className="w-full h-auto rounded-md"
        />
      </div>
    </div>
  );
};
