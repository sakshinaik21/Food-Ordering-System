import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { addressService } from '../services/addressService';
import { orderService } from '../services/orderService';

function Checkout() {
    const navigate = useNavigate();
    const { restaurantId, restaurantName, items, getTotal, clearCart } = useCart();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState('');

    const [showAddForm, setShowAddForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        streetAddress: '',
        city: '',
        state: '',
        zipCode: '',
        landmark: '',
    });

    useEffect(() => {
        if (items.length === 0) {
            navigate('/');
            return;
        }
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const data = await addressService.getMyAddresses();
            setAddresses(data);
            if (data.length > 0) {
                setSelectedAddressId(data[0].id);
            } else {
                setShowAddForm(true);
            }
        } catch (err) {
            setError('Could not load your addresses.');
        } finally {
            setLoading(false);
        }
    };

    const handleNewAddressChange = (e) => {
        setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const created = await addressService.addAddress(newAddress);
            setAddresses([...addresses, created]);
            setSelectedAddressId(created.id);
            setShowAddForm(false);
            setNewAddress({ streetAddress: '', city: '', state: '', zipCode: '', landmark: '' });
        } catch (err) {
            setError('Could not save address. Please check the fields and try again.');
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            setError('Please select a delivery address.');
            return;
        }

        setPlacing(true);
        setError('');

        try {
            const orderData = {
                restaurantId,
                deliveryAddressId: selectedAddressId,
                items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
            };

            const order = await orderService.placeOrder(orderData);
            clearCart();
            navigate('/my-orders', { state: { justPlaced: order.id } });
        } catch (err) {
            const message = err.response?.data?.message || 'Could not place order. Please try again.';
            setError(message);
        } finally {
            setPlacing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <p className="text-center text-gray-500 mt-10">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-2xl mx-auto px-6 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

                {error && (
                    <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>
                )}

                {/* Order summary */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="font-semibold text-gray-800 mb-3">{restaurantName}</h2>
                    <div className="space-y-2">
                        {items.map((item) => (
                            <div key={item.menuItemId} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.name} × {item.quantity}
                </span>
                                <span className="text-gray-800 font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t mt-4 pt-3 flex justify-between font-semibold text-gray-800">
                        <span>Total</span>
                        <span>${getTotal().toFixed(2)}</span>
                    </div>
                </div>

                {/* Address selection */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="font-semibold text-gray-800 mb-3">Delivery Address</h2>

                    {addresses.length > 0 && (
                        <div className="space-y-2 mb-4">
                            {addresses.map((addr) => (
                                <label
                                    key={addr.id}
                                    className="flex items-start gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50"
                                >
                                    <input
                                        type="radio"
                                        name="address"
                                        checked={selectedAddressId === addr.id}
                                        onChange={() => setSelectedAddressId(addr.id)}
                                        className="mt-1"
                                    />
                                    <span className="text-sm text-gray-700">
                    {addr.streetAddress}, {addr.city}, {addr.state} {addr.zipCode}
                                        {addr.landmark && ` (${addr.landmark})`}
                  </span>
                                </label>
                            ))}
                        </div>
                    )}

                    {!showAddForm && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="text-blue-600 text-sm font-medium hover:underline"
                        >
                            + Add a new address
                        </button>
                    )}

                    {showAddForm && (
                        <form onSubmit={handleAddAddress} className="space-y-3 mt-3 border-t pt-4">
                            <input
                                type="text"
                                name="streetAddress"
                                placeholder="Street address"
                                value={newAddress.streetAddress}
                                onChange={handleNewAddressChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="City"
                                    value={newAddress.city}
                                    onChange={handleNewAddressChange}
                                    required
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                                <input
                                    type="text"
                                    name="state"
                                    placeholder="State"
                                    value={newAddress.state}
                                    onChange={handleNewAddressChange}
                                    required
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                            <input
                                type="text"
                                name="zipCode"
                                placeholder="Zip code"
                                value={newAddress.zipCode}
                                onChange={handleNewAddressChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                            <input
                                type="text"
                                name="landmark"
                                placeholder="Landmark (optional)"
                                value={newAddress.landmark}
                                onChange={handleNewAddressChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                            <button
                                type="submit"
                                className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-900"
                            >
                                Save Address
                            </button>
                        </form>
                    )}
                </div>

                <button
                    onClick={handlePlaceOrder}
                    disabled={placing || !selectedAddressId}
                    className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {placing ? 'Placing order...' : `Place Order — $${getTotal().toFixed(2)}`}
                </button>
            </div>
        </div>
    );
}

export default Checkout;