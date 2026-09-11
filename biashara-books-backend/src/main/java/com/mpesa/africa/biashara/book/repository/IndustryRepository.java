package com.mpesa.africa.biashara.book.repository;

import com.mpesa.africa.biashara.book.model.entity.Industry;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface IndustryRepository extends ReactiveCrudRepository<Industry, UUID> {

    Mono<Industry> findByName(String name);
}
