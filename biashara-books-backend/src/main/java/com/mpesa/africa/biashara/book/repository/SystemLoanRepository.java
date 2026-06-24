package com.mpesa.africa.biashara.book.repository;

import com.mpesa.africa.biashara.book.model.entity.SystemLoan;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface SystemLoanRepository extends ReactiveCrudRepository<SystemLoan, UUID> {

    @Query("SELECT * FROM system_loan WHERE id = $1")
    Mono<SystemLoan> findSystemLoanById(UUID id);

    @Query("SELECT * FROM system_loan WHERE user_id = $1")
    Flux<SystemLoan> findAllSystemLoansByUserId(UUID userId);

    @Query("SELECT * FROM system_loan WHERE business_id = $1")
    Flux<SystemLoan> findByBusinessId(UUID businessId);

    @Query("DELETE FROM system_loan WHERE id = $1")
    Mono<Void> deleteSystemLoanById(UUID id);
}
