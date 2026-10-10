import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { restaurantService } from '../services/restaurantService';

function Home() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const data = await restaurantService.getAllRestaurants();
                setRestaurants(data);
            } catch (err) {
                setError('Could not load restaurants. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    // Derive the list of categories actually present across all restaurants' menus
    const availableCategories = Array.from(
        new Set(
            restaurants.flatMap((r) => r.menuItems.map((item) => item.category))
        )
    ).sort();

    const filteredRestaurants = restaurants.filter((restaurant) => {
        const matchesSearch =
            restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            restaurant.address.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
            categoryFilter === 'ALL' ||
            restaurant.menuItems.some((item) => item.category === categoryFilter);

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-6xl mx-auto px-6 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Restaurants Near You</h1>

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <input
                        type="text"
                        placeholder="Search by name or address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">All Categories</option>
                        {availableCategories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                </div>

                {loading && <p className="text-gray-500">Loading restaurants...</p>}

                {error && (
                    <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
                        {error}
                    </div>
                )}

                {!loading && !error && filteredRestaurants.length === 0 && (
                    <p className="text-gray-500">
                        {restaurants.length === 0
                            ? 'No restaurants available right now.'
                            : 'No restaurants match your search.'}
                    </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRestaurants.map((restaurant) => (
                        <Link
                            key={restaurant.id}
                            to={`/restaurants/${restaurant.id}`}
                            className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition"
                        >
                            <h2 className="text-lg font-semibold text-gray-800">{restaurant.name}</h2>
                            <p className="text-gray-500 text-sm mt-1">{restaurant.address}</p>
                            {restaurant.description && (
                                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                                    {restaurant.description}
                                </p>
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Home;