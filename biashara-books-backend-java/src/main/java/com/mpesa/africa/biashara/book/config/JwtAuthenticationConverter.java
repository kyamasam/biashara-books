package com.mpesa.africa.biashara.book.config;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.authentication.ServerAuthenticationConverter;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RequiredArgsConstructor
public class JwtAuthenticationConverter implements ServerAuthenticationConverter {

    private final JwtTokenProvider tokenProvider;

    @Override
    public Mono<Authentication> convert(ServerWebExchange exchange) {
        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Mono.empty();
        }

        String token = authHeader.substring(7);

        if (!tokenProvider.validateToken(token)) {
            return Mono.empty();
        }

        String username = tokenProvider.extractUsername(token);
        UUID userId = tokenProvider.extractUserId(token);

        JwtAuthenticationToken auth = new JwtAuthenticationToken(
                userId,
                username,
                token,
                null
        );

        return Mono.just(auth);
    }
}