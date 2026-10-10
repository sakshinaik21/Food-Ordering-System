package com.foodorder.foodorderingsystem.service;

import com.foodorder.foodorderingsystem.dto.MenuItemDTO;
import com.foodorder.foodorderingsystem.dto.RestaurantDTO;
import com.foodorder.foodorderingsystem.entity.Restaurant;
import com.foodorder.foodorderingsystem.entity.User;
import com.foodorder.foodorderingsystem.repository.RestaurantRepository;
import com.foodorder.foodorderingsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    public RestaurantDTO createRestaurant(RestaurantDTO dto, Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("Owner not found with id: " + ownerId));

        Restaurant restaurant = new Restaurant();
        restaurant.setName(dto.getName());
        restaurant.setDescription(dto.getDescription());
        restaurant.setAddress(dto.getAddress());
        restaurant.setContactNumber(dto.getContactNumber());
        restaurant.setActive(true);
        restaurant.setOwner(owner);

        Restaurant saved = restaurantRepository.save(restaurant);
        return mapToDTO(saved);
    }

    public List<RestaurantDTO> getAllActiveRestaurants() {
        return restaurantRepository.findByIsActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public RestaurantDTO getRestaurantById(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found with id: " + id));
        return mapToDTO(restaurant);
    }

    public List<RestaurantDTO> getRestaurantsByOwner(Long ownerId) {
        return restaurantRepository.findByOwnerId(ownerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public RestaurantDTO updateRestaurant(Long restaurantId, RestaurantDTO dto, Long requesterId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found with id: " + restaurantId));

        if (!restaurant.getOwner().getId().equals(requesterId)) {
            throw new SecurityException("You do not have permission to modify this restaurant");
        }

        restaurant.setName(dto.getName());
        restaurant.setDescription(dto.getDescription());
        restaurant.setAddress(dto.getAddress());
        restaurant.setContactNumber(dto.getContactNumber());

        Restaurant updated = restaurantRepository.save(restaurant);
        return mapToDTO(updated);
    }

    public void deactivateRestaurant(Long restaurantId, Long requesterId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found with id: " + restaurantId));

        if (!restaurant.getOwner().getId().equals(requesterId)) {
            throw new SecurityException("You do not have permission to modify this restaurant");
        }

        restaurant.setActive(false); // soft delete, not a hard delete - preserves order history
        restaurantRepository.save(restaurant);
    }

    private RestaurantDTO mapToDTO(Restaurant restaurant) {
        RestaurantDTO dto = new RestaurantDTO();
        dto.setId(restaurant.getId());
        dto.setName(restaurant.getName());
        dto.setDescription(restaurant.getDescription());
        dto.setAddress(restaurant.getAddress());
        dto.setContactNumber(restaurant.getContactNumber());
        dto.setActive(restaurant.isActive());
        dto.setOwnerId(restaurant.getOwner().getId());

        List<MenuItemDTO> menuItemDTOs = restaurant.getMenuItems().stream()
                .map(item -> {
                    MenuItemDTO itemDto = new MenuItemDTO();
                    itemDto.setId(item.getId());
                    itemDto.setName(item.getName());
                    itemDto.setDescription(item.getDescription());
                    itemDto.setPrice(item.getPrice());
                    itemDto.setImageUrl(item.getImageUrl());
                    itemDto.setCategory(item.getCategory().name());
                    itemDto.setAvailable(item.isAvailable());
                    itemDto.setRestaurantId(restaurant.getId());
                    return itemDto;
                })
                .collect(Collectors.toList());
        dto.setMenuItems(menuItemDTOs);

        return dto;
    }
}