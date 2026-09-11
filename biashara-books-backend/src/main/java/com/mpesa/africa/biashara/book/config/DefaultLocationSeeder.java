package com.mpesa.africa.biashara.book.config;

import com.mpesa.africa.biashara.book.model.entity.Location;
import com.mpesa.africa.biashara.book.repository.BusinessRepository;
import com.mpesa.africa.biashara.book.repository.ExpenseRepository;
import com.mpesa.africa.biashara.book.repository.InventoryRepository;
import com.mpesa.africa.biashara.book.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Slf4j
@Component
@Order(4)
@RequiredArgsConstructor
public class DefaultLocationSeeder implements ApplicationRunner {

    private final BusinessRepository businessRepository;
    private final LocationRepository locationRepository;
    private final InventoryRepository inventoryRepository;
    private final ExpenseRepository expenseRepository;

    @Override
    public void run(ApplicationArguments args) {
        businessRepository.findAll()
                .flatMap(business ->
                        locationRepository.findByBusinessIdAndIsDefault(business.getId(), true)
                                .switchIfEmpty(locationRepository.save(Location.builder()
                                        .name("Main Shop")
                                        .businessId(business.getId())
                                        .isDefault(true)
                                        .build()))
                                .flatMap(location ->
                                        inventoryRepository.assignDefaultLocationToOrphans(location.getId(), business.getId())
                                                .then(expenseRepository.assignDefaultLocationToOrphans(location.getId(), business.getId()))
                                                .thenReturn(location)
                                )
                )
                .doOnNext(location -> log.info("Default location ready for business {}: {}", location.getBusinessId(), location.getId()))
                .doOnComplete(() -> log.info("Default location seeding completed"))
                .doOnError(error -> log.error("Default location seeding failed", error))
                .then()
                .onErrorResume(e -> Mono.empty())
                .block();
    }
}
