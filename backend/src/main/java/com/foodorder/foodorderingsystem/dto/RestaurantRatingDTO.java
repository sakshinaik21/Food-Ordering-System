package com.foodorder.foodorderingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class RestaurantRatingDTO {
    private Double averageRating;
    private Long totalReviews;
}