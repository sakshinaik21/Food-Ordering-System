import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { menuItemService } from '../services/menuItemService';

const CATEGORIES = ['STARTER', 'MAIN_COURSE', 'DESSERT', 'BEVERAGE', 'SNACK'];

function OwnerMenuManagement() {
    const { id: restaurantId } = useParams();

    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        category: 'MAIN_COURSE',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchMenuItems();
    }, [restaurantId]);

    const fetchMenuItems = async () => {
        try {
            const data = await menuItemService.getMenuItemsByRestaurant(restaurantId);
            setMenuItems(data);
        } catch (err) {
            setError('Could not load menu items.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', price: '', imageUrl: '', category: 'MAIN_COURSE' });
        setShowAddForm(false);
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const payload = { ...formData, price: parseFloat(formData.price) };

            if (editingId) {
                const updated = await menuItemService.updateMenuItem(editingId, payload);
                setMenuItems(menuItems.map((item) => (item.id === editingId ? updated : item)));
            } else {
                const created = await menuItemService.addMenuItem(restaurantId, payload);
                setMenuItems([...menuItems, created]);
            }
            resetForm();
        } catch (err) {
            setError('Could not save menu item. Please check the fields and try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (item) => {
        setFormData({
            name: item.name,
            description: item.description || '',
            price: item.price,
            imageUrl: item.imageUrl || '',
            category: item.category,
        });
        setEditingId(item.id);
        setShowAddForm(true);
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm('Remove this item from the menu?')) return;

        try {
            await menuItemService.deleteMenuItem(itemId);
            setMenuItems(menuItems.filter((item) => item.id !== itemId));
        } catch (err) {
            setError('Could not remove this item.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-3xl mx-auto px-6 py-8">
                <Link to="/owner/dashboard" className="text-blue-600 text-sm hover:underline">
                    ← Back to My Restaurants
                </Link>

                <div className="flex items-center justify-between mt-3 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Manage Menu</h1>
                    <button
                        onClick={() => (showAddForm ? resetForm() : setShowAddForm(true))}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
                    >
                        {showAddForm ? 'Cancel' : '+ Add Item'}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>
                )}

                {showAddForm && (
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-lg shadow-md p-6 mb-6 space-y-3"
                    >
                        <input
                            type="text"
                            name="name"
                            placeholder="Item name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <textarea
                            name="description"
                            placeholder="Description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="number"
                                name="price"
                                placeholder="Price"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat.replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <input
                            type="text"
                            name="imageUrl"
                            placeholder="Image URL (optional)"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-900 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : editingId ? 'Update Item' : 'Add Item'}
                        </button>
                    </form>
                )}

                {loading && <p className="text-gray-500">Loading...</p>}

                {!loading && menuItems.length === 0 && !showAddForm && (
                    <p className="text-gray-500">No menu items yet. Click "Add Item" to get started.</p>
                )}

                <div className="space-y-3">
                    {menuItems.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between"
                        >
                            <div>
                                <h3 className="font-medium text-gray-800">{item.name}</h3>
                                <p className="text-gray-500 text-sm">{item.category.replace('_', ' ')}</p>
                                <p className="text-gray-700 font-semibold mt-1">${item.price.toFixed(2)}</p>
                                {!item.available && (
                                    <span className="text-xs text-red-600 font-medium">Unavailable</span>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="text-blue-600 text-sm font-medium hover:underline"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="text-red-600 text-sm font-medium hover:underline"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default OwnerMenuManagement;