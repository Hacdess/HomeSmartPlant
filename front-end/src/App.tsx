import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/pages/Dashboard" element={<Dashboard />} />
      <Route path="/pages/SignIn" element={<SignIn />} />
      <Route path="/pages/SignUp" element={<SignUp />} />
      <Route path="/pages/Profile" element={<Profile />} />
    </Routes>
  )
}
export default App;
