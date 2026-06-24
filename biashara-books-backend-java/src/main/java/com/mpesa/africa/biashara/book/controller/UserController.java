package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.config.JwtTokenProvider;
import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.model.entity.User;
import com.mpesa.africa.biashara.book.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtTokenProvider tokenProvider;

    @GetMapping("/me")
    public Mono<ApiResponse<User>> getCurrentUser(@RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Fetching current user: {}", userId);
        return userService.getUserById(userId)
                .map(user -> ApiResponse.success(user, "User retrieved successfully"));
    }

    @GetMapping("/{id}")
    public Mono<ApiResponse<User>> getUserById(@PathVariable UUID id) {
        log.info("Fetching user: {}", id);
        return userService.getUserById(id)
                .map(user -> ApiResponse.success(user, "User retrieved successfully"));
    }

    @GetMapping
    public Mono<ApiResponse<Flux<User>>> getAllUsers() {
        log.info("Fetching all users");
        return Mono.just(ApiResponse.success(
                userService.getAllUsers(),
                "Users retrieved successfully"
        ));
    }

    @GetMapping("/username/{username}")
    public Mono<ApiResponse<User>> getUserByUsername(@PathVariable String username) {
        log.info("Fetching user by username: {}", username);
        return userService.getUserByUsername(username)
                .map(user -> ApiResponse.success(user, "User retrieved successfully"));
    }

    @GetMapping("/email/{email}")
    public Mono<ApiResponse<User>> getUserByEmail(@PathVariable String email) {
        log.info("Fetching user by email: {}", email);
        return userService.getUserByEmail(email)
                .map(user -> ApiResponse.success(user, "User retrieved successfully"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<ApiResponse<Void>> deleteUser(@PathVariable UUID id) {
        log.info("Deleting user: {}", id);
        return userService.deleteUser(id)
                .then(Mono.just(ApiResponse.<Void>success(null, "User deleted successfully")));
    }

    private UUID extractUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return tokenProvider.extractUserId(token);
    }
}