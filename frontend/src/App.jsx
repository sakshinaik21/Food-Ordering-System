import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantDetail from './pages/RestaurantDetail';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import MyAddresses from './pages/MyAddresses';
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerMenuManagement from './pages/OwnerMenuManagement';
import OwnerOrders from './pages/OwnerOrders';
import EditRestaurant from './pages/EditRestaurant';

function RoleAwareHome() {
    const { isAuthenticated, hasRole, loading } = useAuth();

    if (loading) return null;

    if (isAuthenticated && hasRole('RESTAURANT_OWNER')) {
        return <Navigate to="/owner/dashboard" replace />;
    }

    return <Home />;
}

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<RoleAwareHome />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/restaurants/:id" element={<RestaurantDetail />} />
                        <Route
                            path="/checkout"
                            element={
                                <ProtectedRoute requiredRole="CUSTOMER">
                                    <Checkout />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/my-orders"
                            element={
                                <ProtectedRoute requiredRole="CUSTOMER">
                                    <MyOrders />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/my-addresses"
                            element={
                                <ProtectedRoute requiredRole="CUSTOMER">
                                    <MyAddresses />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/owner/dashboard"
                            element={
                                <ProtectedRoute requiredRole="RESTAURANT_OWNER">
                                    <OwnerDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/owner/restaurants/:id/edit"
                            element={
                                <ProtectedRoute requiredRole="RESTAURANT_OWNER">
                                    <EditRestaurant />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/owner/restaurants/:id/menu"
                            element={
                                <ProtectedRoute requiredRole="RESTAURANT_OWNER">
                                    <OwnerMenuManagement />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/owner/restaurants/:id/orders"
                            element={
                                <ProtectedRoute requiredRole="RESTAURANT_OWNER">
                                    <OwnerOrders />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </BrowserRouter>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;