package com.foodorder.foodorderingsystem.controller;

import com.foodorder.foodorderingsystem.dto.MenuItemDTO;
import com.foodorder.foodorderingsystem.security.CustomUserDetails;
import com.foodorder.foodorderingsystem.service.MenuItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu-items")
@RequiredArgsConstructor
public class MenuItemController {

    private final MenuItemService menuItemService;

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<MenuItemDTO>> getMenuItemsByRestaurant(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(menuItemService.getMenuItemsByRestaurant(restaurantId));
    }


    @PostMapping("/restaurant/{restaurantId}")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<MenuItemDTO> addMenuItem(
            @PathVariable Long restaurantId,
            @Valid @RequestBody MenuItemDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long requesterId = userDetails.getUser().getId();
        MenuItemDTO created = menuItemService.addMenuItem(restaurantId, dto, requesterId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{menuItemId}")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<MenuItemDTO> updateMenuItem(
            @PathVariable Long menuItemId,
            @Valid @RequestBody MenuItemDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long requesterId = userDetails.getUser().getId();
        MenuItemDTO updated = menuItemService.updateMenuItem(menuItemId, dto, requesterId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{menuItemId}")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<Void> deleteMenuItem(
            @PathVariable Long menuItemId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long requesterId = userDetails.getUser().getId();
        menuItemService.deleteMenuItem(menuItemId, requesterId);
        return ResponseEntity.noContent().build();
    }
}