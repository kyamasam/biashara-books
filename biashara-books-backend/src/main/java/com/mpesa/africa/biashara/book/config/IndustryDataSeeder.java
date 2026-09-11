package com.mpesa.africa.biashara.book.config;

import com.mpesa.africa.biashara.book.model.entity.Industry;
import com.mpesa.africa.biashara.book.repository.IndustryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class IndustryDataSeeder implements ApplicationRunner {

    private static final List<String> INDUSTRIES = List.of(
            "Retail & General Trade",
            "Food & Beverage",
            "Agriculture & Farming",
            "Transport & Logistics",
            "Clothing & Fashion",
            "Electronics & Technology",
            "Hardware & Construction",
            "Health & Beauty",
            "Education & Training",
            "Professional Services"
    );

    private final IndustryRepository industryRepository;

    @Override
    public void run(ApplicationArguments args) {
        seedIndustries()
                .doOnComplete(() -> log.info("Industry seed completed"))
                .doOnError(error -> log.error("Industry seed failed", error))
                .blockLast();
    }

    private Flux<Industry> seedIndustries() {
        return Flux.fromIterable(INDUSTRIES)
                .flatMap(name -> industryRepository.findByName(name)
                        .switchIfEmpty(industryRepository.save(Industry.builder()
                                .name(name)
                                .build())));
    }
}
