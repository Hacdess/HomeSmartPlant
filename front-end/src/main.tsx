import ReactDOM from "react-dom/client";
import './index.css';
import App from './App.tsx';
import { AuthProvider } from "./contexts/AuthContext";
import { StrictMode } from "react";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);