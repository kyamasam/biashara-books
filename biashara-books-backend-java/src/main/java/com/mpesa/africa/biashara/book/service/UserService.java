package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.entity.User;
import com.mpesa.africa.biashara.book.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Mono<User> getUserById(UUID id) {
        return userRepository.findById(id)
                .switchIfEmpty(Mono.error(new CustomException("User not found")));
    }

    public Mono<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .switchIfEmpty(Mono.error(new CustomException("User not found")));
    }

    public Mono<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .switchIfEmpty(Mono.error(new CustomException("User not found")));
    }

    public Flux<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Mono<Void> deleteUser(UUID id) {
        return userRepository.findById(id)
                .switchIfEmpty(Mono.error(new CustomException("User not found")))
                .flatMap(userRepository::delete);
    }

    public Mono<Boolean> existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public Mono<Boolean> existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}