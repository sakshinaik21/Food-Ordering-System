import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { restaurantService } from '../services/restaurantService';
import { reviewService } from '../services/reviewService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function RestaurantDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, hasRole } = useAuth();
    const { addItem, items, restaurantId, getItemCount } = useCart();

    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [rating, setRating] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewFormData, setReviewFormData] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState('');

    const isOwner = isAuthenticated && hasRole('RESTAURANT_OWNER');

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const data = await restaurantService.getRestaurantById(id);
                setRestaurant(data);
            } catch (err) {
                setError('Could not load this restaurant.');
            } finally {
                setLoading(false);
            }
        };

        const fetchReviewData = async () => {
            try {
                const [ratingData, reviewsData] = await Promise.all([
                    reviewService.getRestaurantRating(id),
                    reviewService.getReviewsByRestaurant(id),
                ]);
                setRating(ratingData);
                setReviews(reviewsData);
            } catch (err) {
                // Non-critical - page still works without reviews loading successfully
            }
        };

        fetchRestaurant();
        fetchReviewData();
    }, [id]);

    const handleAddToCart = (menuItem) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        addItem(menuItem, restaurant);
    };

    const getQuantityInCart = (menuItemId) => {
        const item = items.find((i) => i.menuItemId === menuItemId);
        return item ? item.quantity : 0;
    };

    const handleReviewChange = (e) => {
        setReviewFormData({ ...reviewFormData, [e.target.name]: e.target.value });
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        setReviewError('');

        try {
            const created = await reviewService.addReview(id, {
                rating: parseInt(reviewFormData.rating, 10),
                comment: reviewFormData.comment,
            });
            setReviews([created, ...reviews]);
            const updatedRating = await reviewService.getRestaurantRating(id);
            setRating(updatedRating);
            setShowReviewForm(false);
            setReviewFormData({ rating: 5, comment: '' });
        } catch (err) {
            const message = err.response?.data?.message || 'Could not submit review.';
            setReviewError(message);
        } finally {
            setSubmittingReview(false);
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

    if (error || !restaurant) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <p className="text-center text-red-600 mt-10">{error || 'Restaurant not found.'}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">{restaurant.name}</h1>
                    <p className="text-gray-500 mt-1">{restaurant.address}</p>
                    {restaurant.description && (
                        <p className="text-gray-600 mt-3">{restaurant.description}</p>
                    )}

                    {rating && rating.totalReviews > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                            <span className="text-yellow-500 font-semibold">★ {rating.averageRating}</span>
                            <span className="text-gray-500 text-sm">
                ({rating.totalReviews} review{rating.totalReviews !== 1 ? 's' : ''})
              </span>
                        </div>
                    )}
                </div>

                {isOwner && (
                    <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg mb-6 text-sm">
                        You're viewing this as a restaurant owner. Ordering is only available for customer accounts.
                    </div>
                )}

                <h2 className="text-xl font-semibold text-gray-800 mb-4">Menu</h2>

                {restaurant.menuItems.length === 0 ? (
                    <p className="text-gray-500">This restaurant hasn't added any menu items yet.</p>
                ) : (
                    <div className="space-y-3 mb-8">
                        {restaurant.menuItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between"
                            >
                                <div>
                                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                                    {item.description && (
                                        <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                                    )}
                                    <p className="text-gray-700 font-semibold mt-1">${item.price.toFixed(2)}</p>
                                </div>

                                {!isOwner && (
                                    <button
                                        onClick={() => handleAddToCart(item)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
                                    >
                                        {getQuantityInCart(item.id) > 0
                                            ? `Add another (${getQuantityInCart(item.id)} in cart)`
                                            : 'Add to cart'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Reviews</h2>
                    {isAuthenticated && hasRole('CUSTOMER') && (
                        <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="text-blue-600 text-sm font-medium hover:underline"
                        >
                            {showReviewForm ? 'Cancel' : '+ Write a review'}
                        </button>
                    )}
                </div>

                {reviewError && (
                    <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">
                        {reviewError}
                    </div>
                )}

                {showReviewForm && (
                    <form
                        onSubmit={handleSubmitReview}
                        className="bg-white rounded-lg shadow-md p-5 mb-4 space-y-3"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                            <select
                                name="rating"
                                value={reviewFormData.rating}
                                onChange={handleReviewChange}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                {[5, 4, 3, 2, 1].map((n) => (
                                    <option key={n} value={n}>
                                        {n} star{n !== 1 ? 's' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <textarea
                            name="comment"
                            placeholder="Share your experience..."
                            value={reviewFormData.comment}
                            onChange={handleReviewChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <button
                            type="submit"
                            disabled={submittingReview}
                            className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-900 disabled:opacity-50"
                        >
                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                )}

                {reviews.length === 0 ? (
                    <p className="text-gray-500 mb-10">No reviews yet.</p>
                ) : (
                    <div className="space-y-3 mb-10">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-white rounded-lg shadow-sm p-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-800">{review.reviewerName}</span>
                                    <span className="text-yellow-500 text-sm">
                    {'★'.repeat(review.rating)}
                                        {'☆'.repeat(5 - review.rating)}
                  </span>
                                </div>
                                {review.comment && (
                                    <p className="text-gray-600 text-sm mt-2">{review.comment}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {!isOwner && restaurantId === restaurant.id && getItemCount() > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white py-4 px-6 flex items-center justify-between shadow-lg">
                    <span className="font-medium">{getItemCount()} item(s) in cart</span>
                    <button
                        onClick={() => navigate('/checkout')}
                        className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition"
                    >
                        View Cart & Checkout
                    </button>
                </div>
            )}
        </div>
    );
}

export default RestaurantDetail;