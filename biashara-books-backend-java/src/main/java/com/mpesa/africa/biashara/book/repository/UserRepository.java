package com.mpesa.africa.biashara.book.repository;

import com.mpesa.africa.biashara.book.model.entity.User;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface UserRepository extends ReactiveCrudRepository<User, UUID> {

    @Query("SELECT * FROM users WHERE username = $1")
    Mono<User> findByUsername(String username);

    @Query("SELECT * FROM users WHERE email = $1")
    Mono<User> findByEmail(String email);

    @Query("SELECT * FROM users WHERE username = $1 OR email = $2")
    Mono<User> findByUsernameOrEmail(String username, String email);

    @Query("SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)")
    Mono<Boolean> existsByUsername(String username);

    @Query("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)")
    Mono<Boolean> existsByEmail(String email);
}
