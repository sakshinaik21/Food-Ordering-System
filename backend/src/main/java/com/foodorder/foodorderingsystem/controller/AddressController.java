package com.foodorder.foodorderingsystem.controller;

import com.foodorder.foodorderingsystem.dto.AddressDTO;
import com.foodorder.foodorderingsystem.security.CustomUserDetails;
import com.foodorder.foodorderingsystem.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;


    @PostMapping
    public ResponseEntity<AddressDTO> addAddress(
            @Valid @RequestBody AddressDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        AddressDTO created = addressService.addAddress(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/my-addresses")
    public ResponseEntity<List<AddressDTO>> getMyAddresses(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        return ResponseEntity.ok(addressService.getAddressesByUser(userId));
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable Long addressId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        addressService.deleteAddress(addressId, userId);
        return ResponseEntity.noContent().build();
    }
}