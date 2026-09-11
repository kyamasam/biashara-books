package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.model.entity.Industry;
import com.mpesa.africa.biashara.book.repository.IndustryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/public/industries")
@RequiredArgsConstructor
public class IndustryController {

    private final IndustryRepository industryRepository;

    @GetMapping
    public Mono<ApiResponse<List<Industry>>> getIndustries() {
        return industryRepository.findAll()
                .collectList()
                .map(industries -> ApiResponse.success(industries, "Industries retrieved successfully"));
    }
}
