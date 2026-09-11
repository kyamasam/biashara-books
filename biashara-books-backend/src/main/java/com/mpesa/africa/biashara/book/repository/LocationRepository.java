package com.mpesa.africa.biashara.book.repository;

import com.mpesa.africa.biashara.book.model.entity.Location;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface LocationRepository extends ReactiveCrudRepository<Location, UUID> {
    Flux<Location> findByBusinessId(UUID businessId);
    Mono<Location> findByBusinessIdAndIsDefault(UUID businessId, Boolean isDefault);
}
