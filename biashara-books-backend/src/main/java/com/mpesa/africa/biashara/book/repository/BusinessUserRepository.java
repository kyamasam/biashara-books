package com.mpesa.africa.biashara.book.repository;

import com.mpesa.africa.biashara.book.model.entity.BusinessUser;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface BusinessUserRepository extends ReactiveCrudRepository<BusinessUser, UUID> {
    Flux<BusinessUser> findByBusinessId(UUID businessId);
    Mono<Boolean> existsByBusinessIdAndUserId(UUID businessId, UUID userId);
}
