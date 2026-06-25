package com.mpesa.africa.biashara.book.config;

import com.mpesa.africa.biashara.book.model.entity.Business;
import com.mpesa.africa.biashara.book.model.entity.SystemLoan;
import com.mpesa.africa.biashara.book.model.enums.InstitutionType;
import com.mpesa.africa.biashara.book.repository.BusinessRepository;
import com.mpesa.africa.biashara.book.repository.SystemLoanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SystemLoanDataSeeder implements ApplicationRunner {

    private static final List<SeedLoan> LOANS = List.of(
            new SeedLoan(
                    "Equity Bank",
                    InstitutionType.bank,
                    "https://upload.wikimedia.org/wikipedia/en/8/8a/Equity_Bank_Logo.png",
                    "75000.00",
                    "6500.00",
                    LocalDate.of(2027, 6, 30)
            ),
            new SeedLoan(
                    "KCB Bank",
                    InstitutionType.bank,
                    "https://kcbgroup.com/imgs/2021.jpeg",
                    "120000.00",
                    "10000.00",
                    LocalDate.of(2028, 3, 31)
            ),
            new SeedLoan(
                    "I&M Bank",
                    InstitutionType.bank,
                    "https://www.imbankgroup.com/ke/wp-content/uploads/sites/2/2025/01/im-logo.png",
                    "95000.00",
                    "8200.00",
                    LocalDate.of(2027, 12, 31)
            )
    );

    private final BusinessRepository businessRepository;
    private final SystemLoanRepository systemLoanRepository;

    @Override
    public void run(ApplicationArguments args) {
        seedSystemLoans()
                .doOnSuccess(ignored -> log.info("System loan seed completed"))
                .doOnError(error -> log.error("System loan seed failed", error))
                .block();
    }

    private Mono<Void> seedSystemLoans() {
        return businessRepository.findAll()
                .flatMap(this::seedLoansForBusiness)
                .then();
    }

    private Flux<SystemLoan> seedLoansForBusiness(Business business) {
        return Flux.fromIterable(LOANS)
                .flatMap(seedLoan -> seedLoanForBusiness(business, seedLoan));
    }

    private Mono<SystemLoan> seedLoanForBusiness(Business business, SeedLoan seedLoan) {
        return systemLoanRepository.findByBusinessIdAndInstitutionName(business.getId(), seedLoan.institutionName())
                .switchIfEmpty(systemLoanRepository.save(SystemLoan.builder()
                        .institutionName(seedLoan.institutionName())
                        .institutionType(seedLoan.institutionType())
                        .institutionLogoUrl(seedLoan.institutionLogoUrl())
                        .loanBalance(new BigDecimal(seedLoan.loanBalance()))
                        .monthlyRepaymentAmount(new BigDecimal(seedLoan.monthlyRepaymentAmount()))
                        .endDate(seedLoan.endDate())
                        .userId(business.getUserId())
                        .businessId(business.getId())
                        .build()));
    }

    private record SeedLoan(
            String institutionName,
            InstitutionType institutionType,
            String institutionLogoUrl,
            String loanBalance,
            String monthlyRepaymentAmount,
            LocalDate endDate
    ) {
    }
}
