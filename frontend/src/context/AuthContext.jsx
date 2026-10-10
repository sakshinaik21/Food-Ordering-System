import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On first app load, check if there's a valid token already saved
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const isExpired = decoded.exp * 1000 < Date.now();

                if (isExpired) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                } else {
                    const savedUser = JSON.parse(localStorage.getItem('user'));
                    setUser(savedUser);
                }
            } catch (err) {
                // Token is malformed/corrupted - clear it out
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = (authResponse) => {
        const { token, userId, fullName, email, roles } = authResponse;
        const userData = { userId, fullName, email, roles };

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const hasRole = (role) => {
        return user?.roles?.includes(role) ?? false;
    };

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        hasRole,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}