package com.foodorder.foodorderingsystem.controller;

import com.foodorder.foodorderingsystem.dto.RestaurantDTO;
import com.foodorder.foodorderingsystem.security.CustomUserDetails;
import com.foodorder.foodorderingsystem.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;


    @GetMapping
    public ResponseEntity<List<RestaurantDTO>> getAllRestaurants() {
        return ResponseEntity.ok(restaurantService.getAllActiveRestaurants());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantDTO> getRestaurantById(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getRestaurantById(id));
    }

    

    @PostMapping
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<RestaurantDTO> createRestaurant(
            @Valid @RequestBody RestaurantDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long ownerId = userDetails.getUser().getId();
        RestaurantDTO created = restaurantService.createRestaurant(dto, ownerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/my-restaurants")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<List<RestaurantDTO>> getMyRestaurants(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long ownerId = userDetails.getUser().getId();
        return ResponseEntity.ok(restaurantService.getRestaurantsByOwner(ownerId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<RestaurantDTO> updateRestaurant(
            @PathVariable Long id,
            @Valid @RequestBody RestaurantDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long requesterId = userDetails.getUser().getId();
        RestaurantDTO updated = restaurantService.updateRestaurant(id, dto, requesterId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<Void> deactivateRestaurant(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long requesterId = userDetails.getUser().getId();
        restaurantService.deactivateRestaurant(id, requesterId);
        return ResponseEntity.noContent().build();
    }
}