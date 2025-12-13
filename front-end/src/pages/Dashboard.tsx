// DASHBOARD: PAGE CHINH, HIEN THI THONG CAC SENSOR
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageLayout from "../layouts/PageLayout";

const Dashboard = () => {
  const { username } = useAuth();
  if (!username) return <Navigate to="/pages/SignIn" />;

  return (
    <PageLayout title="Dashboard">
      <p>Dữ liệu cảm biến sẽ hiển thị tại đây.</p>
    </PageLayout>
  );
};
export default Dashboard;
