// QUẢN LÝ TRẠNG THÁI ĐĂNG NHẬP 
import React, { createContext, useContext, useState} from 'react';

export type User = {
  full_name: string;
  user_name: string;
  email: string;
};

interface AuthContextType {
  user: User | null;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null, setUser: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);