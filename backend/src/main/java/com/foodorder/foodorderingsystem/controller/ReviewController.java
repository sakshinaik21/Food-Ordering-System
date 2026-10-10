package com.foodorder.foodorderingsystem.controller;

import com.foodorder.foodorderingsystem.dto.ReviewDTO;
import com.foodorder.foodorderingsystem.dto.RestaurantRatingDTO;
import com.foodorder.foodorderingsystem.security.CustomUserDetails;
import com.foodorder.foodorderingsystem.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByRestaurant(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(reviewService.getReviewsByRestaurant(restaurantId));
    }

    @GetMapping("/restaurant/{restaurantId}/rating")
    public ResponseEntity<RestaurantRatingDTO> getRestaurantRating(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(reviewService.getRestaurantRating(restaurantId));
    }

    @PostMapping("/restaurant/{restaurantId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewDTO> addReview(
            @PathVariable Long restaurantId,
            @Valid @RequestBody ReviewDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        ReviewDTO created = reviewService.addReview(restaurantId, dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        reviewService.deleteReview(reviewId, userId);
        return ResponseEntity.noContent().build();
    }
}