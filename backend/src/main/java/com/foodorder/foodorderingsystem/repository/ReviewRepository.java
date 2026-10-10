package com.foodorder.foodorderingsystem.repository;

import com.foodorder.foodorderingsystem.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);

    Optional<Review> findByUserIdAndRestaurantId(Long userId, Long restaurantId);

    boolean existsByUserIdAndRestaurantId(Long userId, Long restaurantId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.restaurant.id = :restaurantId")
    Double findAverageRatingByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.restaurant.id = :restaurantId")
    Long countByRestaurantId(@Param("restaurantId") Long restaurantId);
}