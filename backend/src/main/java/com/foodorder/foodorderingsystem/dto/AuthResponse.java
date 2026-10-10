package com.foodorder.foodorderingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long userId;
    private String fullName;
    private String email;
    private List<String> roles;
}