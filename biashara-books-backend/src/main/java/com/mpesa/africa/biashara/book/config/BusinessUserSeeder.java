package com.mpesa.africa.biashara.book.config;

import com.mpesa.africa.biashara.book.model.entity.Business;
import com.mpesa.africa.biashara.book.model.entity.BusinessUser;
import com.mpesa.africa.biashara.book.model.enums.BusinessUserRole;
import com.mpesa.africa.biashara.book.repository.BusinessRepository;
import com.mpesa.africa.biashara.book.repository.BusinessUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Slf4j
@Order(10)
@Component
@RequiredArgsConstructor
public class BusinessUserSeeder implements ApplicationRunner {

    private final BusinessRepository businessRepository;
    private final BusinessUserRepository businessUserRepository;

    @Override
    public void run(ApplicationArguments args) {
        seedBusinessUsers()
                .doOnSuccess(ignored -> log.info("Business user seed completed"))
                .doOnError(error -> log.error("Business user seed failed", error))
                .block();
    }

    private Mono<Void> seedBusinessUsers() {
        return businessRepository.findAll()
                .flatMap(this::seedAdminForBusiness)
                .then();
    }

    private Mono<BusinessUser> seedAdminForBusiness(Business business) {
        return businessUserRepository.existsByBusinessIdAndUserId(business.getId(), business.getUserId())
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.empty();
                    }
                    return businessUserRepository.save(BusinessUser.builder()
                            .businessId(business.getId())
                            .userId(business.getUserId())
                            .role(BusinessUserRole.ADMIN)
                            .build());
                });
    }
}
