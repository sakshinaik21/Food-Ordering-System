import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requiredRole }) {
    const { isAuthenticated, hasRole, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && !hasRole(requiredRole)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-600 font-medium">
                    You don't have permission to access this page.
                </p>
            </div>
        );
    }

    return children;
}

export default ProtectedRoute;