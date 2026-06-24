package com.mpesa.africa.biashara.book.repository;

import com.mpesa.africa.biashara.book.model.entity.ExpenseType;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface ExpenseTypeRepository extends ReactiveCrudRepository<ExpenseType, UUID> {

    @Query("SELECT * FROM expense_types WHERE name ILIKE CONCAT('%', $1, '%')")
    Flux<ExpenseType> findByNameContaining(String name);

    @Query("SELECT EXISTS(SELECT 1 FROM expense_types WHERE name = $1)")
    Mono<Boolean> existsByName(String name);
}