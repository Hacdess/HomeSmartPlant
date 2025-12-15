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
    <div className="text-justify flex flex-col md:flex-row justify-center align-center gap-5">
      <div className="md:w-1/2">
        <h1 >Hệ thống tưới và chiếu sáng thông minh</h1>
        <h2>Giám sát và điều khiển vườn cây của bạn từ xa. Tự động tưới nước, điều chỉnh ánh sáng và theo dõi sức khỏe cây trồng theo thời gian thực.</h2>
        <Link to="/dashboard">Thử ngay</Link>
      </div>
      <div className="md:w-1/2">
        <img 
          src="/plants_homepage.jpg"
          className="w-full h-auto"
        />
      </div>
    </div>
  );
};
