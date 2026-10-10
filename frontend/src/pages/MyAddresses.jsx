import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { addressService } from '../services/addressService';

function MyAddresses() {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    const [showAddForm, setShowAddForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        streetAddress: '',
        city: '',
        state: '',
        zipCode: '',
        landmark: '',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const data = await addressService.getMyAddresses();
            setAddresses(data);
        } catch (err) {
            setError('Could not load your addresses.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const created = await addressService.addAddress(newAddress);
            setAddresses([...addresses, created]);
            setShowAddForm(false);
            setNewAddress({ streetAddress: '', city: '', state: '', zipCode: '', landmark: '' });
        } catch (err) {
            setError('Could not save address. Please check the fields and try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (addressId) => {
        if (!window.confirm('Delete this address?')) return;

        setDeletingId(addressId);
        try {
            await addressService.deleteAddress(addressId);
            setAddresses(addresses.filter((a) => a.id !== addressId));
        } catch (err) {
            const message =
                err.response?.data?.message ||
                'Could not delete this address. It may be linked to an existing order.';
            setError(message);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-2xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">My Addresses</h1>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
                    >
                        {showAddForm ? 'Cancel' : '+ Add Address'}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>
                )}

                {showAddForm && (
                    <form
                        onSubmit={handleAdd}
                        className="bg-white rounded-lg shadow-md p-6 mb-6 space-y-3"
                    >
                        <input
                            type="text"
                            name="streetAddress"
                            placeholder="Street address"
                            value={newAddress.streetAddress}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                name="city"
                                placeholder="City"
                                value={newAddress.city}
                                onChange={handleChange}
                                required
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                            <input
                                type="text"
                                name="state"
                                placeholder="State"
                                value={newAddress.state}
                                onChange={handleChange}
                                required
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <input
                            type="text"
                            name="zipCode"
                            placeholder="Zip code"
                            value={newAddress.zipCode}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <input
                            type="text"
                            name="landmark"
                            placeholder="Landmark (optional)"
                            value={newAddress.landmark}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-900 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Address'}
                        </button>
                    </form>
                )}

                {loading && <p className="text-gray-500">Loading...</p>}

                {!loading && addresses.length === 0 && !showAddForm && (
                    <p className="text-gray-500">
                        You haven't saved any addresses yet. Click "Add Address" to get started.
                    </p>
                )}

                <div className="space-y-3">
                    {addresses.map((addr) => (
                        <div
                            key={addr.id}
                            className="bg-white rounded-lg shadow-sm p-4 flex items-start justify-between"
                        >
                            <div>
                                <p className="text-gray-800">
                                    {addr.streetAddress}, {addr.city}, {addr.state} {addr.zipCode}
                                </p>
                                {addr.landmark && (
                                    <p className="text-gray-500 text-sm mt-1">Near {addr.landmark}</p>
                                )}
                            </div>
                            <button
                                onClick={() => handleDelete(addr.id)}
                                disabled={deletingId === addr.id}
                                className="text-red-600 text-sm font-medium hover:underline disabled:opacity-50"
                            >
                                {deletingId === addr.id ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MyAddresses;