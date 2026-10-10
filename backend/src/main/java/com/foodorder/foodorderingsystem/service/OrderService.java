package com.foodorder.foodorderingsystem.service;

import com.foodorder.foodorderingsystem.dto.*;
import com.foodorder.foodorderingsystem.entity.*;
import com.foodorder.foodorderingsystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final AddressRepository addressRepository;
    private final MenuItemRepository menuItemRepository;

    @Transactional
    public OrderResponse placeOrder(PlaceOrderRequest request, Long customerId) {

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + customerId));

        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found with id: " + request.getRestaurantId()));

        if (!restaurant.isActive()) {
            throw new IllegalArgumentException("This restaurant is not currently accepting orders");
        }

        Address deliveryAddress = addressRepository.findById(request.getDeliveryAddressId())
                .orElseThrow(() -> new IllegalArgumentException("Address not found with id: " + request.getDeliveryAddressId()));

        if (!deliveryAddress.getUser().getId().equals(customerId)) {
            throw new SecurityException("This address does not belong to you");
        }

        Order order = new Order();
        order.setCustomer(customer);
        order.setRestaurant(restaurant);
        order.setDeliveryAddress(deliveryAddress);
        order.setStatus(Order.OrderStatus.PENDING);

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {

            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Menu item not found with id: " + itemRequest.getMenuItemId()));

            if (!menuItem.getRestaurant().getId().equals(restaurant.getId())) {
                throw new IllegalArgumentException(
                        "Menu item '" + menuItem.getName() + "' does not belong to the selected restaurant");
            }

            if (!menuItem.isAvailable()) {
                throw new IllegalArgumentException("Menu item '" + menuItem.getName() + "' is currently unavailable");
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPriceAtPurchase(menuItem.getPrice());

            order.addOrderItem(orderItem);

            BigDecimal lineTotal = menuItem.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            totalAmount = totalAmount.add(lineTotal);
        }

        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);
        return mapToResponse(savedOrder);
    }

    public List<OrderResponse> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerIdOrderByPlacedAtDesc(customerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersByRestaurant(Long restaurantId, Long requesterId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found with id: " + restaurantId));

        if (!restaurant.getOwner().getId().equals(requesterId)) {
            throw new SecurityException("You do not have permission to view this restaurant's orders");
        }

        return orderRepository.findByRestaurantId(restaurantId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String newStatus, Long requesterId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + orderId));

        if (!order.getRestaurant().getOwner().getId().equals(requesterId)) {
            throw new SecurityException("You do not have permission to update this order");
        }

        Order.OrderStatus status;
        try {
            status = Order.OrderStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid order status: " + newStatus);
        }

        order.setStatus(status);
        if (status == Order.OrderStatus.DELIVERED) {
            order.setDeliveredAt(java.time.LocalDateTime.now());
        }

        Order updated = orderRepository.save(order);
        return mapToResponse(updated);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long customerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + orderId));

        if (!order.getCustomer().getId().equals(customerId)) {
            throw new SecurityException("You do not have permission to cancel this order");
        }

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new IllegalArgumentException(
                    "This order can no longer be cancelled (current status: " + order.getStatus() + ")");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        Order updated = orderRepository.save(order);
        return mapToResponse(updated);
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderResponse.OrderItemResponse> itemResponses = order.getOrderItems().stream()
                .map(item -> new OrderResponse.OrderItemResponse(
                        item.getMenuItem().getName(),
                        item.getQuantity(),
                        item.getPriceAtPurchase(),
                        item.getSubtotal()
                ))
                .collect(Collectors.toList());

        return new OrderResponse(
                order.getId(),
                order.getStatus().name(),
                order.getTotalAmount(),
                order.getPlacedAt(),
                order.getRestaurant().getName(),
                itemResponses
        );
    }
}