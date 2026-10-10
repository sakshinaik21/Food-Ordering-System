package com.foodorder.foodorderingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String status;
    private BigDecimal totalAmount;
    private LocalDateTime placedAt;
    private String restaurantName;
    private List<OrderItemResponse> items;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class OrderItemResponse {
        private String menuItemName;
        private int quantity;
        private BigDecimal priceAtPurchase;
        private BigDecimal subtotal;
    }
}