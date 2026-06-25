package com.mpesa.africa.biashara.book.repository;

import com.mpesa.africa.biashara.book.model.entity.*;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.UUID;

@Repository
public interface LoanRepository  extends ReactiveCrudRepository<OtherLoan, UUID> {

    // Other Loans
    @Query("SELECT * FROM other_loans WHERE id = $1")
    Mono<OtherLoan> findOtherLoanById(UUID id);

    @Query("SELECT * FROM other_loans WHERE user_id = $1")
    Flux<OtherLoan> findAllOtherLoansByUserId(UUID userId);

    @Query("DELETE FROM other_loans WHERE id = $1")
    Mono<Void> deleteOtherLoanById(UUID id);

    @Query("SELECT COALESCE(SUM(loan_balance), 0) FROM other_loans WHERE user_id = $1")
    Mono<BigDecimal> sumLoanBalanceByUserId(UUID userId);
}