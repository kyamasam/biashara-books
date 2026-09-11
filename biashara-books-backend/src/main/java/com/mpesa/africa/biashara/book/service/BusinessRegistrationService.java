package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.config.JwtTokenProvider;
import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.request.BusinessRegistrationRequest;
import com.mpesa.africa.biashara.book.model.dto.request.BusinessRequest;
import com.mpesa.africa.biashara.book.model.dto.request.LocationRegistrationRequest;
import com.mpesa.africa.biashara.book.model.dto.request.UserRegistrationRequest;
import com.mpesa.africa.biashara.book.model.dto.response.BusinessRegistrationResponse;
import com.mpesa.africa.biashara.book.model.entity.Business;
import com.mpesa.africa.biashara.book.model.entity.BusinessUser;
import com.mpesa.africa.biashara.book.model.entity.Location;
import com.mpesa.africa.biashara.book.model.entity.User;
import com.mpesa.africa.biashara.book.model.enums.BusinessUserRole;
import com.mpesa.africa.biashara.book.repository.BusinessRepository;
import com.mpesa.africa.biashara.book.repository.BusinessUserRepository;
import com.mpesa.africa.biashara.book.repository.LocationRepository;
import com.mpesa.africa.biashara.book.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.reactive.TransactionalOperator;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusinessRegistrationService {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final LocationRepository locationRepository;
    private final BusinessUserRepository businessUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final TransactionalOperator transactionalOperator;

    public Mono<BusinessRegistrationResponse> register(BusinessRegistrationRequest request) {
        log.info("Registering business for user: {}", request.getUser().getUsername());

        Mono<BusinessRegistrationResponse> pipeline = validateUniqueness(request.getUser())
                .then(createUser(request.getUser()))
                .flatMap(user -> createBusiness(user, request.getBusiness())
                        .flatMap(business -> resolveAndSaveLocations(business.getId(), request.getLocations())
                                .flatMap(locations -> {
                                    Location defaultLoc = locations.stream()
                                            .filter(l -> Boolean.TRUE.equals(l.getIsDefault()))
                                            .findFirst()
                                            .orElse(locations.get(0));
                                    return createBusinessUser(user.getId(), business.getId(), defaultLoc.getId())
                                            .then(updateUserCurrentBusiness(user, business.getId()))
                                            .thenReturn(buildResponse(user, business, locations));
                                })));

        return transactionalOperator.transactional(pipeline);
    }

    private Mono<Void> validateUniqueness(UserRegistrationRequest req) {
        Mono<Boolean> emailCheck = (req.getEmail() != null && !req.getEmail().isBlank())
                ? userRepository.existsByEmail(req.getEmail())
                : Mono.just(false);

        return Mono.zip(
                userRepository.existsByUsername(req.getUsername()),
                emailCheck,
                userRepository.existsByPhoneNumber(req.getPhoneNumber())
        ).flatMap(tuple -> {
            if (tuple.getT1()) return Mono.error(new CustomException("Username already exists"));
            if (tuple.getT2()) return Mono.error(new CustomException("Email already exists"));
            if (tuple.getT3()) return Mono.error(new CustomException("Phone number already registered"));
            return Mono.empty();
        }).then();
    }

    private Mono<User> createUser(UserRegistrationRequest req) {
        User user = User.builder()
                .username(req.getUsername())
                .email(req.getEmail())
                .phoneCode(req.getPhoneCode())
                .phoneNumber(req.getPhoneNumber())
                .pinHash(passwordEncoder.encode(req.getPin()))
                .build();
        return userRepository.save(user);
    }

    private Mono<Business> createBusiness(User user, BusinessRequest req) {
        Business business = Business.builder()
                .name(req.getName())
                .userId(user.getId())
                .industryId(req.getIndustryId())
                .shortCode(req.getShortCode())
                .shortCodeType(req.getShortCodeType())
                .shortcodeBalance(req.getShortcodeBalance() != null ? req.getShortcodeBalance() : BigDecimal.ZERO)
                .shortcodeLoanLimit(req.getShortcodeLoanLimit() != null ? req.getShortcodeLoanLimit() : BigDecimal.ZERO)
                .fastdukaApiKey(req.getFastdukaApiKey())
                .fastdukaOrgId(req.getFastdukaOrgId())
                .fastdukaConfigId(req.getFastdukaConfigId())
                .build();
        return businessRepository.save(business);
    }

    private Mono<List<Location>> resolveAndSaveLocations(UUID businessId, List<LocationRegistrationRequest> requested) {
        List<LocationRegistrationRequest> locationList = (requested == null || requested.isEmpty())
                ? List.of(LocationRegistrationRequest.builder().name("Main Shop").isDefault(Boolean.TRUE).build())
                : requested;

        boolean hasDefault = locationList.stream().anyMatch(r -> Boolean.TRUE.equals(r.getIsDefault()));

        List<Location> entities = IntStream.range(0, locationList.size())
                .mapToObj(i -> {
                    LocationRegistrationRequest req = locationList.get(i);
                    boolean isDefault = hasDefault ? Boolean.TRUE.equals(req.getIsDefault()) : (i == 0);
                    return Location.builder()
                            .name(req.getName())
                            .businessId(businessId)
                            .isDefault(isDefault)
                            .build();
                })
                .toList();

        return locationRepository.saveAll(entities).collectList();
    }

    private Mono<BusinessUser> createBusinessUser(UUID userId, UUID businessId, UUID defaultLocationId) {
        BusinessUser businessUser = BusinessUser.builder()
                .userId(userId)
                .businessId(businessId)
                .role(BusinessUserRole.ADMIN)
                .currentLocationId(defaultLocationId)
                .build();
        return businessUserRepository.save(businessUser);
    }

    private Mono<User> updateUserCurrentBusiness(User user, UUID businessId) {
        user.setCurrentBusinessId(businessId);
        return userRepository.save(user);
    }

    private BusinessRegistrationResponse buildResponse(User user, Business business, List<Location> locations) {
        String token = tokenProvider.generateToken(user.getId(), user.getUsername());
        return BusinessRegistrationResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phoneCode(user.getPhoneCode())
                .phoneNumber(user.getPhoneNumber())
                .business(business)
                .locations(locations)
                .build();
    }
}
