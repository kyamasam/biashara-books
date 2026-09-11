package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.request.LocationRequest;
import com.mpesa.africa.biashara.book.model.entity.Location;
import com.mpesa.africa.biashara.book.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;

    public Mono<Location> createDefaultLocation(UUID businessId) {
        log.info("Creating default location for business: {}", businessId);
        Location location = Location.builder()
                .name("Main")
                .businessId(businessId)
                .isDefault(true)
                .build();
        return locationRepository.save(location);
    }

    public Mono<Location> createLocation(LocationRequest request, UUID businessId) {
        log.info("Creating location: {} for business: {}", request.getName(), businessId);
        Location location = Location.builder()
                .name(request.getName())
                .businessId(businessId)
                .isDefault(false)
                .build();
        return locationRepository.save(location);
    }

    public Flux<Location> getLocationsForBusiness(UUID businessId) {
        return locationRepository.findByBusinessId(businessId);
    }

    public Mono<Location> getLocationById(UUID id, UUID businessId) {
        return locationRepository.findById(id)
                .filter(location -> businessId.equals(location.getBusinessId()))
                .switchIfEmpty(Mono.error(new CustomException("Location not found or access denied")));
    }

    public Mono<Location> updateLocation(UUID id, LocationRequest request, UUID businessId) {
        return locationRepository.findById(id)
                .filter(location -> businessId.equals(location.getBusinessId()))
                .switchIfEmpty(Mono.error(new CustomException("Location not found or access denied")))
                .flatMap(existing -> {
                    existing.setName(request.getName());
                    return locationRepository.save(existing);
                });
    }

    public Mono<Void> deleteLocation(UUID id, UUID businessId) {
        return locationRepository.findById(id)
                .filter(location -> businessId.equals(location.getBusinessId()))
                .switchIfEmpty(Mono.error(new CustomException("Location not found or access denied")))
                .flatMap(location -> {
                    if (Boolean.TRUE.equals(location.getIsDefault())) {
                        return Mono.error(new CustomException("Cannot delete the default location"));
                    }
                    return locationRepository.delete(location);
                });
    }
}
