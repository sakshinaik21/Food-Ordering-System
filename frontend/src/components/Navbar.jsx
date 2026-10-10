import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, isAuthenticated, logout, hasRole } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-blue-600">
                FoodOrder
            </Link>

            <div className="flex items-center gap-6">
                {(!isAuthenticated || hasRole('CUSTOMER')) && (
                    <Link to="/" className="text-gray-700 hover:text-blue-600">
                        Restaurants
                    </Link>
                )}

                {isAuthenticated && hasRole('CUSTOMER') && (
                    <>
                        <Link to="/my-orders" className="text-gray-700 hover:text-blue-600">
                            My Orders
                        </Link>
                        <Link to="/my-addresses" className="text-gray-700 hover:text-blue-600">
                            My Addresses
                        </Link>
                    </>
                )}

                {isAuthenticated && hasRole('RESTAURANT_OWNER') && (
                    <Link to="/owner/dashboard" className="text-gray-700 hover:text-blue-600">
                        My Restaurants
                    </Link>
                )}

                {isAuthenticated ? (
                    <div className="flex items-center gap-4">
                        <span className="text-gray-500 text-sm">Hi, {user.fullName}</span>
                        <button
                            onClick={handleLogout}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Link
                            to="/login"
                            className="text-gray-700 hover:text-blue-600 text-sm font-medium"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
                        >
                            Register
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;