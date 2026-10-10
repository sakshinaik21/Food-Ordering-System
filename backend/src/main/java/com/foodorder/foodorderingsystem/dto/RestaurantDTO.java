package com.foodorder.foodorderingsystem.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RestaurantDTO {
    private Long id;

    @NotBlank(message = "Restaurant name is required")
    private String name;

    private String description;

    @NotBlank(message = "Address is required")
    private String address;

    private String contactNumber;

    private boolean isActive;

    private Long ownerId;

    private List<MenuItemDTO> menuItems;
}