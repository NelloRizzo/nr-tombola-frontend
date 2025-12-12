// src/context/AuthProvider.tsx
import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import authService from '../../services/authService'; 

interface AuthContextType {
    isAuthenticated: boolean;
    loading: boolean;
    refreshAuth: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const checkAuth = async () => {
        try {
            const result = await authService.verifyToken();
            setIsAuthenticated(result.success);
        } catch (error) {
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth(); // Check iniziale al mount
    }, []);

    const refreshAuth = async () => {
        setLoading(true);
        await checkAuth();
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, loading, refreshAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };