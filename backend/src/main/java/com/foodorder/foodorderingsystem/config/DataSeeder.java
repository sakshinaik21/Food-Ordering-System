package com.foodorder.foodorderingsystem.config;

import com.foodorder.foodorderingsystem.entity.Role;
import com.foodorder.foodorderingsystem.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        seedRoleIfMissing(Role.RoleName.CUSTOMER);
        seedRoleIfMissing(Role.RoleName.RESTAURANT_OWNER);
        seedRoleIfMissing(Role.RoleName.ADMIN);
    }

    private void seedRoleIfMissing(Role.RoleName roleName) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            Role role = new Role();
            role.setName(roleName);
            roleRepository.save(role);
            System.out.println("Seeded role: " + roleName);
        }
    }
}