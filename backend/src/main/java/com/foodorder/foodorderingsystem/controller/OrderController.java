package com.foodorder.foodorderingsystem.controller;

import com.foodorder.foodorderingsystem.dto.OrderResponse;
import com.foodorder.foodorderingsystem.dto.PlaceOrderRequest;
import com.foodorder.foodorderingsystem.security.CustomUserDetails;
import com.foodorder.foodorderingsystem.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderResponse> placeOrder(
            @Valid @RequestBody PlaceOrderRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long customerId = userDetails.getUser().getId();
        OrderResponse response = orderService.placeOrder(request, customerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long customerId = userDetails.getUser().getId();
        return ResponseEntity.ok(orderService.getOrdersByCustomer(customerId));
    }

    @GetMapping("/restaurant/{restaurantId}")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<List<OrderResponse>> getOrdersByRestaurant(
            @PathVariable Long restaurantId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long requesterId = userDetails.getUser().getId();
        return ResponseEntity.ok(orderService.getOrdersByRestaurant(restaurantId, requesterId));
    }

    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long requesterId = userDetails.getUser().getId();
        String newStatus = body.get("status");
        OrderResponse updated = orderService.updateOrderStatus(orderId, newStatus, requesterId);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{orderId}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long customerId = userDetails.getUser().getId();
        OrderResponse cancelled = orderService.cancelOrder(orderId, customerId);
        return ResponseEntity.ok(cancelled);
    }
}