import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { restaurantService } from '../services/restaurantService';

function EditRestaurant() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        contactNumber: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [deactivating, setDeactivating] = useState(false);

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const data = await restaurantService.getRestaurantById(id);
                setFormData({
                    name: data.name,
                    description: data.description || '',
                    address: data.address,
                    contactNumber: data.contactNumber || '',
                });
            } catch (err) {
                setError('Could not load restaurant details.');
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurant();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            await restaurantService.updateRestaurant(id, formData);
            navigate('/owner/dashboard');
        } catch (err) {
            const message = err.response?.data?.message || 'Could not update restaurant.';
            setError(message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async () => {
        if (!window.confirm('Deactivate this restaurant? It will stop accepting new orders.')) {
            return;
        }

        setDeactivating(true);
        try {
            await restaurantService.deactivateRestaurant(id);
            navigate('/owner/dashboard');
        } catch (err) {
            setError('Could not deactivate restaurant.');
            setDeactivating(false);
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

            <div className="max-w-xl mx-auto px-6 py-8">
                <Link to="/owner/dashboard" className="text-blue-600 text-sm hover:underline">
                    ← Back to My Restaurants
                </Link>

                <h1 className="text-2xl font-bold text-gray-800 mt-3 mb-6">Edit Restaurant</h1>

                {error && (
                    <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Number
                        </label>
                        <input
                            type="text"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-300">
                    <h2 className="text-sm font-semibold text-red-700 mb-2">Danger Zone</h2>
                    <p className="text-sm text-gray-500 mb-3">
                        Deactivating stops new orders but keeps your order history intact.
                    </p>
                    <button
                        onClick={handleDeactivate}
                        disabled={deactivating}
                        className="bg-red-50 text-red-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-100 transition disabled:opacity-50"
                    >
                        {deactivating ? 'Deactivating...' : 'Deactivate Restaurant'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditRestaurant;