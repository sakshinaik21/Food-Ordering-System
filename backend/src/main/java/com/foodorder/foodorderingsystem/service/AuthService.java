package com.foodorder.foodorderingsystem.service;

import com.foodorder.foodorderingsystem.dto.AuthResponse;
import com.foodorder.foodorderingsystem.dto.LoginRequest;
import com.foodorder.foodorderingsystem.dto.RegisterRequest;
import com.foodorder.foodorderingsystem.entity.Role;
import com.foodorder.foodorderingsystem.entity.User;
import com.foodorder.foodorderingsystem.repository.RoleRepository;
import com.foodorder.foodorderingsystem.repository.UserRepository;
import com.foodorder.foodorderingsystem.security.CustomUserDetails;
import com.foodorder.foodorderingsystem.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        
        Role.RoleName roleName;
        try {
            roleName = Role.RoleName.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid role: " + request.getRole());
        }


        if (roleName == Role.RoleName.ADMIN) {
            throw new IllegalArgumentException("Cannot self-register as ADMIN");
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException("Role not seeded in database: " + roleName));

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // never store plain text
        user.setPhoneNumber(request.getPhoneNumber());

        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);

        User savedUser = userRepository.save(user);

        String token = jwtUtil.generateToken(new CustomUserDetails(savedUser));

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                List.of(roleName.name())
        );
    }

    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalStateException("User vanished after successful authentication"));

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtUtil.generateToken(userDetails);

        List<String> roleNames = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                roleNames
        );
    }
}