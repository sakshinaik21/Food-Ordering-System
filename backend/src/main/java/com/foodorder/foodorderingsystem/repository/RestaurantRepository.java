package com.foodorder.foodorderingsystem.repository;

import com.foodorder.foodorderingsystem.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByOwnerId(Long ownerId);
    List<Restaurant> findByIsActiveTrue();
}