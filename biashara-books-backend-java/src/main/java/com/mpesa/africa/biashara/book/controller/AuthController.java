package com.mpesa.africa.biashara.book.controller;
import com.mpesa.africa.biashara.book.model.dto.request.AuthRequest;
import com.mpesa.africa.biashara.book.model.dto.request.LoginRequest;
import com.mpesa.africa.biashara.book.model.dto.request.PinLoginRequest;
import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.model.dto.response.AuthResponse;
import com.mpesa.africa.biashara.book.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public Mono<ApiResponse<AuthResponse>> register(@Valid @RequestBody AuthRequest request) {
        log.info("Register endpoint called for: {}", request.getUsername());
        return authService.register(request)
                .map(response -> ApiResponse.success(response, "Registration successful"))
                .doOnError(error -> log.error("Registration error: {}", error.getMessage()));
    }

    @PostMapping("/login")
    public Mono<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login endpoint called for: {}", request.getUsername());
        return authService.login(request)
                .map(response -> ApiResponse.success(response, "Login successful"))
                .doOnError(error -> log.error("Login error: {}", error.getMessage()));
    }

    @PostMapping("/login/pin")
    public Mono<ApiResponse<AuthResponse>> loginWithPin(@Valid @RequestBody PinLoginRequest request) {
        log.info("PIN login endpoint called for phone: {}", request.getPhoneNumber());
        return authService.loginWithPin(request)
                .map(response -> ApiResponse.success(response, "Login successful"))
                .doOnError(error -> log.error("PIN login error: {}", error.getMessage()));
    }
}
