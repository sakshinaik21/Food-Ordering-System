import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { restaurantService } from '../services/restaurantService';

function OwnerDashboard() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showAddForm, setShowAddForm] = useState(false);
    const [newRestaurant, setNewRestaurant] = useState({
        name: '',
        description: '',
        address: '',
        contactNumber: '',
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const data = await restaurantService.getMyRestaurants();
            setRestaurants(data);
        } catch (err) {
            setError('Could not load your restaurants.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setNewRestaurant({ ...newRestaurant, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        setError('');

        try {
            const created = await restaurantService.createRestaurant(newRestaurant);
            setRestaurants([...restaurants, created]);
            setShowAddForm(false);
            setNewRestaurant({ name: '', description: '', address: '', contactNumber: '' });
        } catch (err) {
            setError('Could not create restaurant. Please check the fields and try again.');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">My Restaurants</h1>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
                    >
                        {showAddForm ? 'Cancel' : '+ Add Restaurant'}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>
                )}

                {showAddForm && (
                    <form
                        onSubmit={handleCreate}
                        className="bg-white rounded-lg shadow-md p-6 mb-6 space-y-3"
                    >
                        <input
                            type="text"
                            name="name"
                            placeholder="Restaurant name"
                            value={newRestaurant.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <textarea
                            name="description"
                            placeholder="Description"
                            value={newRestaurant.description}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <input
                            type="text"
                            name="address"
                            placeholder="Address"
                            value={newRestaurant.address}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <input
                            type="text"
                            name="contactNumber"
                            placeholder="Contact number"
                            value={newRestaurant.contactNumber}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <button
                            type="submit"
                            disabled={creating}
                            className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-900 disabled:opacity-50"
                        >
                            {creating ? 'Creating...' : 'Create Restaurant'}
                        </button>
                    </form>
                )}

                {loading && <p className="text-gray-500">Loading...</p>}

                {!loading && restaurants.length === 0 && !showAddForm && (
                    <p className="text-gray-500">
                        You haven't created any restaurants yet. Click "Add Restaurant" to get started.
                    </p>
                )}

                <div className="space-y-4">
                    {restaurants.map((restaurant) => (
                        <div
                            key={restaurant.id}
                            className="bg-white rounded-lg shadow-md p-5 flex items-center justify-between"
                        >
                            <div>
                                <h2 className="font-semibold text-gray-800">{restaurant.name}</h2>
                                <p className="text-gray-500 text-sm">{restaurant.address}</p>
                                <span
                                    className={`inline-block mt-1 text-xs font-medium px-2 py-1 rounded-full ${
                                        restaurant.active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}
                                >
                  {restaurant.active ? 'Active' : 'Inactive'}
                </span>
                            </div>

                            <div className="flex gap-3">
                                <Link
                                    to={`/owner/restaurants/${restaurant.id}/edit`}
                                    className="text-blue-600 text-sm font-medium hover:underline"
                                >
                                    Edit
                                </Link>
                                <Link
                                    to={`/owner/restaurants/${restaurant.id}/menu`}
                                    className="text-blue-600 text-sm font-medium hover:underline"
                                >
                                    Manage Menu
                                </Link>
                                <Link
                                    to={`/owner/restaurants/${restaurant.id}/orders`}
                                    className="text-blue-600 text-sm font-medium hover:underline"
                                >
                                    View Orders
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default OwnerDashboard;