package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.request.BusinessRequest;
import com.mpesa.africa.biashara.book.model.entity.Business;
import com.mpesa.africa.biashara.book.repository.BusinessRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusinessService {

    private final BusinessRepository businessRepository;

    public Mono<Business> createBusiness(BusinessRequest request, UUID userId) {
        log.info("Creating business: {} for user: {}", request.getName(), userId);

        Business business = Business.builder()
                .name(request.getName())
                .userId(userId)
                .shortCode(request.getShortCode())
                .shortCodeType(request.getShortCodeType())
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

    public Mono<Business> updateBusiness(UUID id, BusinessRequest request, UUID userId) {
        return businessRepository.findById(id)
                .filter(business -> business.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Business not found or access denied")))
                .flatMap(existingBusiness -> {
                    existingBusiness.setName(request.getName());
                    existingBusiness.setShortCode(request.getShortCode());
                    existingBusiness.setShortCodeType(request.getShortCodeType());
                    return businessRepository.save(existingBusiness);
                });
    }

    public Mono<Void> deleteBusiness(UUID id, UUID userId) {
        return businessRepository.findById(id)
                .filter(business -> business.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Business not found or access denied")))
                .flatMap(businessRepository::delete);
    }
}