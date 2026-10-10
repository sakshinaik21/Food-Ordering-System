package com.foodorder.foodorderingsystem.service;

import com.foodorder.foodorderingsystem.dto.ReviewDTO;
import com.foodorder.foodorderingsystem.dto.RestaurantRatingDTO;
import com.foodorder.foodorderingsystem.entity.Restaurant;
import com.foodorder.foodorderingsystem.entity.Review;
import com.foodorder.foodorderingsystem.entity.User;
import com.foodorder.foodorderingsystem.repository.OrderRepository;
import com.foodorder.foodorderingsystem.repository.RestaurantRepository;
import com.foodorder.foodorderingsystem.repository.ReviewRepository;
import com.foodorder.foodorderingsystem.repository.UserRepository;
import com.foodorder.foodorderingsystem.entity.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final OrderRepository orderRepository;

    public ReviewDTO addReview(Long restaurantId, ReviewDTO dto, Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found with id: " + restaurantId));

        boolean hasOrdered = orderRepository.findByCustomerId(userId).stream()
                .anyMatch(order -> order.getRestaurant().getId().equals(restaurantId));

        if (!hasOrdered) {
            throw new IllegalArgumentException("You can only review restaurants you've ordered from");
        }

        if (reviewRepository.existsByUserIdAndRestaurantId(userId, restaurantId)) {
            throw new IllegalArgumentException("You have already reviewed this restaurant");
        }

        Review review = new Review();
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        review.setUser(user);
        review.setRestaurant(restaurant);

        Review saved = reviewRepository.save(review);
        return mapToDTO(saved);
    }

    public List<ReviewDTO> getReviewsByRestaurant(Long restaurantId) {
        return reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public RestaurantRatingDTO getRestaurantRating(Long restaurantId) {
        Double average = reviewRepository.findAverageRatingByRestaurantId(restaurantId);
        Long count = reviewRepository.countByRestaurantId(restaurantId);

        double roundedAverage = average != null ? Math.round(average * 10) / 10.0 : 0.0;

        return new RestaurantRatingDTO(roundedAverage, count);
    }

    public void deleteReview(Long reviewId, Long requesterId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found with id: " + reviewId));

        if (!review.getUser().getId().equals(requesterId)) {
            throw new SecurityException("You do not have permission to delete this review");
        }

        reviewRepository.delete(review);
    }

    private ReviewDTO mapToDTO(Review review) {
        return new ReviewDTO(
                review.getId(),
                review.getRating(),
                review.getComment(),
                review.getUser().getFullName(),
                review.getCreatedAt()
        );
    }
}