// QUẢN LÝ TRẠNG THÁI ĐĂNG NHẬP 
import React, { createContext, useContext, useState} from 'react';

interface AuthContextType {
  username: string | null;
  login: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    username: null,
    login: () => {},    
    logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [username, setUsername] = useState<string | null>(null);
    const login = (username: string) => setUsername(username);
    const logout = () => setUsername(null);

    return (
        <AuthContext.Provider value={{ username, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);