package com.mpesa.africa.biashara.book.config;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationManager implements ReactiveAuthenticationManager {

    private final JwtTokenProvider tokenProvider;

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {
        String token = authentication.getCredentials().toString();

        if (tokenProvider.validateToken(token)) {
            String username = tokenProvider.extractUsername(token);
            UUID userId = tokenProvider.extractUserId(token);

            JwtAuthenticationToken auth = new JwtAuthenticationToken(
                    userId,
                    username,
                    token,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
            );
            auth.setAuthenticated(true);
            return Mono.just(auth);
        }

        return Mono.empty();
    }
}