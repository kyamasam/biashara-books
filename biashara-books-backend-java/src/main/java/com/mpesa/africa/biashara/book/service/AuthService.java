package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.config.JwtTokenProvider;
import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.request.AuthRequest;
import com.mpesa.africa.biashara.book.model.dto.request.LoginRequest;
import com.mpesa.africa.biashara.book.model.dto.response.AuthResponse;
import com.mpesa.africa.biashara.book.model.entity.User;
import com.mpesa.africa.biashara.book.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public Mono<AuthResponse> register(AuthRequest request) {
        log.info("Registering new user: {}", request.getUsername());

        return Mono.zip(
                        userRepository.existsByUsername(request.getUsername()),
                        userRepository.existsByEmail(request.getEmail())
                )
                .flatMap(tuple -> {
                    if (tuple.getT1()) {
                        return Mono.error(new CustomException("Username already exists"));
                    }
                    if (tuple.getT2()) {
                        return Mono.error(new CustomException("Email already exists"));
                    }

                    User user = User.builder()
                            .username(request.getUsername())
                            .email(request.getEmail())
                            .passwordHash(passwordEncoder.encode(request.getPassword()))
                            .build();

                    return userRepository.save(user)
                            .flatMap(savedUser -> {
                                String token = tokenProvider.generateToken(savedUser.getId(), savedUser.getUsername());
                                return Mono.just(AuthResponse.builder()
                                        .token(token)
                                        .userId(savedUser.getId())
                                        .username(savedUser.getUsername())
                                        .email(savedUser.getEmail())
                                        .build());
                            });
                });
    }

    public Mono<AuthResponse> login(LoginRequest request) {
        log.info("Login attempt for user: {}", request.getUsername());

        return userRepository.findByUsername(request.getUsername())
                .switchIfEmpty(Mono.error(new CustomException("Invalid username or password")))
                .flatMap(user -> {
                    if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                        return Mono.error(new CustomException("Invalid username or password"));
                    }

                    String token = tokenProvider.generateToken(user.getId(), user.getUsername());
                    return Mono.just(AuthResponse.builder()
                            .token(token)
                            .userId(user.getId())
                            .username(user.getUsername())
                            .email(user.getEmail())
                            .build());
                });
    }

    public Mono<User> getCurrentUser(UUID userId) {
        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new CustomException("User not found")));
    }
}
