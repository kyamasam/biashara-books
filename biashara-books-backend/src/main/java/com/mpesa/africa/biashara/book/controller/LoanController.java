package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.config.JwtAuthenticationToken;
import com.mpesa.africa.biashara.book.model.dto.request.LoanRequest;
import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.model.entity.OtherLoan;
import com.mpesa.africa.biashara.book.model.entity.SystemLoan;
import com.mpesa.africa.biashara.book.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    @PostMapping("/other")
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<OtherLoan>> createOtherLoan(@Valid @RequestBody LoanRequest request) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Creating other loan for user: {}", userId);
            return loanService.createOtherLoan(request, userId);
        }).map(loan -> ApiResponse.success(loan, "Other loan created successfully"));
    }

    @GetMapping("/other/{id}")
    public Mono<ApiResponse<OtherLoan>> getOtherLoanById(@PathVariable UUID id) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching other loan: {} for user: {}", id, userId);
            return loanService.getOtherLoanById(id, userId);
        }).map(loan -> ApiResponse.success(loan, "Other loan retrieved successfully"));
    }

    @GetMapping("/other")
    public Mono<ApiResponse<List<OtherLoan>>> getAllOtherLoans() {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching all other loans for user: {}", userId);
            return loanService.getAllOtherLoans(userId).collectList();
        }).map(loans -> ApiResponse.success(loans, "Other loans retrieved successfully"));
    }

    @PutMapping("/other/{id}")
    public Mono<ApiResponse<OtherLoan>> updateOtherLoan(@PathVariable UUID id, @Valid @RequestBody LoanRequest request) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Updating other loan: {} for user: {}", id, userId);
            return loanService.updateOtherLoan(id, request, userId);
        }).map(loan -> ApiResponse.success(loan, "Other loan updated successfully"));
    }

    @DeleteMapping("/other/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<ApiResponse<Void>> deleteOtherLoan(@PathVariable UUID id) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Deleting other loan: {} for user: {}", id, userId);
            return loanService.deleteOtherLoan(id, userId);
        }).then(Mono.just(ApiResponse.<Void>success(null, "Other loan deleted successfully")));
    }

    @PostMapping("/system")
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<SystemLoan>> createSystemLoan(@Valid @RequestBody LoanRequest request) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Creating system loan for user: {}", userId);
            return loanService.createSystemLoan(request, userId);
        }).map(loan -> ApiResponse.success(loan, "System loan created successfully"));
    }

    @GetMapping("/system/{id}")
    public Mono<ApiResponse<SystemLoan>> getSystemLoanById(@PathVariable UUID id) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching system loan: {} for user: {}", id, userId);
            return loanService.getSystemLoanById(id, userId);
        }).map(loan -> ApiResponse.success(loan, "System loan retrieved successfully"));
    }

    @GetMapping("/system")
    public Mono<ApiResponse<List<SystemLoan>>> getAllSystemLoans() {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching all system loans for user: {}", userId);
            return loanService.getAllSystemLoans(userId).collectList();
        }).map(loans -> ApiResponse.success(loans, "System loans retrieved successfully"));
    }

    @PutMapping("/system/{id}")
    public Mono<ApiResponse<SystemLoan>> updateSystemLoan(@PathVariable UUID id, @Valid @RequestBody LoanRequest request) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Updating system loan: {} for user: {}", id, userId);
            return loanService.updateSystemLoan(id, request, userId);
        }).map(loan -> ApiResponse.success(loan, "System loan updated successfully"));
    }

    @DeleteMapping("/system/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<ApiResponse<Void>> deleteSystemLoan(@PathVariable UUID id) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Deleting system loan: {} for user: {}", id, userId);
            return loanService.deleteSystemLoan(id, userId);
        }).then(Mono.just(ApiResponse.<Void>success(null, "System loan deleted successfully")));
    }

    private Mono<UUID> getCurrentUserId() {
        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> (JwtAuthenticationToken) ctx.getAuthentication())
                .map(JwtAuthenticationToken::getUserId);
    }
}
