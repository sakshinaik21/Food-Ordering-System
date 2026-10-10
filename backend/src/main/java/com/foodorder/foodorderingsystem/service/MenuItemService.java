package com.foodorder.foodorderingsystem.service;

import com.foodorder.foodorderingsystem.dto.MenuItemDTO;
import com.foodorder.foodorderingsystem.entity.MenuItem;
import com.foodorder.foodorderingsystem.entity.Restaurant;
import com.foodorder.foodorderingsystem.repository.MenuItemRepository;
import com.foodorder.foodorderingsystem.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;

    public MenuItemDTO addMenuItem(Long restaurantId, MenuItemDTO dto, Long requesterId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found with id: " + restaurantId));

        if (!restaurant.getOwner().getId().equals(requesterId)) {
            throw new SecurityException("You do not have permission to modify this restaurant's menu");
        }

        MenuItem.Category category;
        try {
            category = MenuItem.Category.valueOf(dto.getCategory().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid category: " + dto.getCategory());
        }

        MenuItem menuItem = new MenuItem();
        menuItem.setName(dto.getName());
        menuItem.setDescription(dto.getDescription());
        menuItem.setPrice(dto.getPrice());
        menuItem.setImageUrl(dto.getImageUrl());
        menuItem.setCategory(category);
        menuItem.setAvailable(true);
        menuItem.setRestaurant(restaurant);

        MenuItem saved = menuItemRepository.save(menuItem);
        return mapToDTO(saved);
    }

    public List<MenuItemDTO> getMenuItemsByRestaurant(Long restaurantId) {
        return menuItemRepository.findByRestaurantIdAndIsAvailableTrue(restaurantId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public MenuItemDTO updateMenuItem(Long menuItemId, MenuItemDTO dto, Long requesterId) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new IllegalArgumentException("Menu item not found with id: " + menuItemId));

        if (!menuItem.getRestaurant().getOwner().getId().equals(requesterId)) {
            throw new SecurityException("You do not have permission to modify this menu item");
        }

        menuItem.setName(dto.getName());
        menuItem.setDescription(dto.getDescription());
        menuItem.setPrice(dto.getPrice());
        menuItem.setImageUrl(dto.getImageUrl());
        menuItem.setAvailable(dto.isAvailable());

        MenuItem updated = menuItemRepository.save(menuItem);
        return mapToDTO(updated);
    }

    public void deleteMenuItem(Long menuItemId, Long requesterId) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new IllegalArgumentException("Menu item not found with id: " + menuItemId));

        if (!menuItem.getRestaurant().getOwner().getId().equals(requesterId)) {
            throw new SecurityException("You do not have permission to modify this menu item");
        }

        menuItem.setAvailable(false); // soft delete again, same reasoning as Restaurant
        menuItemRepository.save(menuItem);
    }

    private MenuItemDTO mapToDTO(MenuItem item) {
        MenuItemDTO dto = new MenuItemDTO();
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setDescription(item.getDescription());
        dto.setPrice(item.getPrice());
        dto.setImageUrl(item.getImageUrl());
        dto.setCategory(item.getCategory().name());
        dto.setAvailable(item.isAvailable());
        dto.setRestaurantId(item.getRestaurant().getId());
        return dto;
    }
}