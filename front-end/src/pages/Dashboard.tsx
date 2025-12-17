// DASHBOARD: PAGE CHINH, HIEN THI THONG CAC SENSOR
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageLayout from "../layout/PageLayout";

const Dashboard = () => {
  const { user, setUser } = useAuth();
  return (
      <p>Dữ liệu cảm biến sẽ hiển thị tại đây.</p>
  );
};
export default Dashboard;
