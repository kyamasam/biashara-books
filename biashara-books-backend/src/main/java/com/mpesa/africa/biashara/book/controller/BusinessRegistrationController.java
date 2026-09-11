package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.model.dto.request.BusinessRegistrationRequest;
import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.model.dto.response.BusinessRegistrationResponse;
import com.mpesa.africa.biashara.book.service.BusinessRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class BusinessRegistrationController {

    private final BusinessRegistrationService businessRegistrationService;

    @PostMapping("/register-business")
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<BusinessRegistrationResponse>> registerBusiness(
            @Valid @RequestBody BusinessRegistrationRequest request) {
        log.info("Business registration endpoint called for: {}, request: {}", request.getUser().getUsername(), request);
        return businessRegistrationService.register(request)
                .map(response -> ApiResponse.success(response, "Business registration successful"))
                .doOnError(error -> log.error("Business registration error: {}", error.getMessage(), error));
    }
}
