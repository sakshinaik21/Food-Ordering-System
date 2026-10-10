package com.foodorder.foodorderingsystem.repository;

import com.foodorder.foodorderingsystem.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId);
    List<Order> findByRestaurantId(Long restaurantId);
    List<Order> findByCustomerIdOrderByPlacedAtDesc(Long customerId);
}