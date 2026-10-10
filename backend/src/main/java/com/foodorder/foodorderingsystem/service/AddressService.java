package com.foodorder.foodorderingsystem.service;

import com.foodorder.foodorderingsystem.dto.AddressDTO;
import com.foodorder.foodorderingsystem.entity.Address;
import com.foodorder.foodorderingsystem.entity.User;
import com.foodorder.foodorderingsystem.repository.AddressRepository;
import com.foodorder.foodorderingsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressDTO addAddress(AddressDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        Address address = new Address();
        address.setStreetAddress(dto.getStreetAddress());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setZipCode(dto.getZipCode());
        address.setLandmark(dto.getLandmark());
        address.setDefaultAddress(dto.isDefaultAddress());
        address.setUser(user);

        Address saved = addressRepository.save(address);
        return mapToDTO(saved);
    }

    public List<AddressDTO> getAddressesByUser(Long userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public void deleteAddress(Long addressId, Long requesterId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Address not found with id: " + addressId));

        if (!address.getUser().getId().equals(requesterId)) {
            throw new SecurityException("You do not have permission to delete this address");
        }

        addressRepository.delete(address);
    }

    private AddressDTO mapToDTO(Address address) {
        AddressDTO dto = new AddressDTO();
        dto.setId(address.getId());
        dto.setStreetAddress(address.getStreetAddress());
        dto.setCity(address.getCity());
        dto.setState(address.getState());
        dto.setZipCode(address.getZipCode());
        dto.setLandmark(address.getLandmark());
        dto.setDefaultAddress(address.isDefaultAddress());
        return dto;
    }
}