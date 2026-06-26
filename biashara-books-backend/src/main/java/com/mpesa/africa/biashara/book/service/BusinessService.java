package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.request.BusinessRequest;
import com.mpesa.africa.biashara.book.model.dto.response.FastDukaAccountBalanceResponse;
import com.mpesa.africa.biashara.book.model.entity.Business;
import com.mpesa.africa.biashara.book.repository.BusinessRepository;
import com.mpesa.africa.biashara.book.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusinessService {

    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final BusinessScoreService businessScoreService;
    @Qualifier("fastDukaWebClient")
    private final WebClient fastDukaWebClient;

    public Mono<Business> createBusiness(BusinessRequest request, UUID userId) {
        log.info("Creating business: {} for user: {}", request.getName(), userId);

        Business business = Business.builder()
                .name(request.getName())
                .userId(userId)
                .shortCode(request.getShortCode())
                .shortCodeType(request.getShortCodeType())
                .shortcodeBalance(defaultAmount(request.getShortcodeBalance()))
                .shortcodeLoanLimit(defaultAmount(request.getShortcodeLoanLimit()))
                .fastdukaApiKey(request.getFastdukaApiKey())
                .fastdukaOrgId(request.getFastdukaOrgId())
                .fastdukaConfigId(request.getFastdukaConfigId())
                .build();

        return businessRepository.save(business);
    }

    public Mono<Business> getBusinessById(UUID id, UUID userId) {
        return businessRepository.findById(id)
                .filter(business -> business.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Business not found or access denied")));
    }

    public Flux<Business> getAllBusinesses(UUID userId) {
        return businessRepository.findByUserId(userId);
    }

    public Mono<Business> refreshCurrentBusinessBalance(UUID userId) {
        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new CustomException("User not found")))
                .flatMap(user -> {
                    if (user.getCurrentBusinessId() == null) {
                        return Mono.error(new CustomException("No active business selected"));
                    }
                    return getBusinessById(user.getCurrentBusinessId(), userId);
                })
                .flatMap(business -> {
                    WebClient.RequestHeadersSpec<?> request = fastDukaWebClient.get()
                            .uri(uriBuilder -> uriBuilder
                                    .path("/api/account_balance/by_short_code/")
                                    .queryParam("short_code", business.getShortCode())
                                    .build());

                    if (business.getFastdukaApiKey() != null && !business.getFastdukaApiKey().isBlank()) {
                        request = request.header(HttpHeaders.AUTHORIZATION, "Api-Key " + business.getFastdukaApiKey());
                    }

                    return request.retrieve()
                            .onStatus(HttpStatusCode::is4xxClientError, response ->
                                    response.bodyToMono(String.class)
                                            .flatMap(body -> Mono.error(new CustomException("Balance refresh failed: " + body))))
                            .onStatus(HttpStatusCode::is5xxServerError, response ->
                                    Mono.error(new CustomException("Balance service unavailable, please try again")))
                            .bodyToMono(FastDukaAccountBalanceResponse.class)
                            .flatMap(balanceResponse -> {
                                if (balanceResponse.getAccountBalance() == null) {
                                    log.info("FastDuka returned no account balance for short_code: {}", business.getShortCode());
                                } else {
                                    business.setShortcodeBalance(balanceResponse.getAccountBalance());
                                }
                                return businessScoreService.calculateScore(userId, 1)
                                        .doOnNext(score -> business.setShortcodeLoanLimit(score.getLoanLimit()))
                                        .onErrorResume(e -> {
                                            log.warn("Could not recalculate loan limit during balance refresh: {}", e.getMessage());
                                            return Mono.empty();
                                        })
                                        .then(businessRepository.save(business));
                            });
                });
    }

    public Mono<Business> updateBusiness(UUID id, BusinessRequest request, UUID userId) {
        return businessRepository.findById(id)
                .filter(business -> business.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Business not found or access denied")))
                .flatMap(existingBusiness -> {
                    existingBusiness.setName(request.getName());
                    existingBusiness.setShortCode(request.getShortCode());
                    existingBusiness.setShortCodeType(request.getShortCodeType());
                    existingBusiness.setShortcodeBalance(defaultAmount(request.getShortcodeBalance()));
                    existingBusiness.setShortcodeLoanLimit(defaultAmount(request.getShortcodeLoanLimit()));
                    existingBusiness.setFastdukaApiKey(request.getFastdukaApiKey());
                    existingBusiness.setFastdukaOrgId(request.getFastdukaOrgId());
                    existingBusiness.setFastdukaConfigId(request.getFastdukaConfigId());
                    return businessRepository.save(existingBusiness);
                });
    }

    public Mono<Void> deleteBusiness(UUID id, UUID userId) {
        return businessRepository.findById(id)
                .filter(business -> business.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Business not found or access denied")))
                .flatMap(businessRepository::delete);
    }

    private BigDecimal defaultAmount(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }
}
