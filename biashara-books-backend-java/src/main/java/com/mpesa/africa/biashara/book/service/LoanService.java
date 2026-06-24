// service/LoanService.java
package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.request.LoanRequest;
import com.mpesa.africa.biashara.book.model.entity.OtherLoan;
import com.mpesa.africa.biashara.book.model.entity.SystemLoan;
import com.mpesa.africa.biashara.book.repository.LoanRepository;
import com.mpesa.africa.biashara.book.repository.SystemLoanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final SystemLoanRepository systemLoanRepository;

    // Other Loans CRUD
    public Mono<OtherLoan> createOtherLoan(LoanRequest request, UUID userId) {
        log.info("Creating other loan for user: {}", userId);

        OtherLoan loan = OtherLoan.builder()
                .institutionName(request.getInstitutionName())
                .institutionType(request.getInstitutionType())
                .loanBalance(request.getLoanBalance())
                .monthlyRepaymentAmount(request.getMonthlyRepaymentAmount())
                .endDate(request.getEndDate())
                .userId(userId)
                .build();

        return loanRepository.save(loan);
    }

    public Mono<OtherLoan> getOtherLoanById(UUID id, UUID userId) {
        return loanRepository.findOtherLoanById(id)
                .filter(loan -> loan.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Loan not found or access denied")));
    }

    public Flux<OtherLoan> getAllOtherLoans(UUID userId) {
        return loanRepository.findAllOtherLoansByUserId(userId);
    }

    public Mono<OtherLoan> updateOtherLoan(UUID id, LoanRequest request, UUID userId) {
        return loanRepository.findOtherLoanById(id)
                .filter(loan -> loan.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Loan not found or access denied")))
                .flatMap(existingLoan -> {
                    existingLoan.setInstitutionName(request.getInstitutionName());
                    existingLoan.setInstitutionType(request.getInstitutionType());
                    existingLoan.setLoanBalance(request.getLoanBalance());
                    existingLoan.setMonthlyRepaymentAmount(request.getMonthlyRepaymentAmount());
                    existingLoan.setEndDate(request.getEndDate());
                    return loanRepository.save(existingLoan);
                });
    }

    public Mono<Void> deleteOtherLoan(UUID id, UUID userId) {
        return loanRepository.findOtherLoanById(id)
                .filter(loan -> loan.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Loan not found or access denied")))
                .flatMap(loan -> loanRepository.deleteOtherLoanById(id));
    }

    // System Loans CRUD
    public Mono<SystemLoan> createSystemLoan(LoanRequest request, UUID userId) {
        log.info("Creating system loan for user: {}", userId);

        SystemLoan loan = SystemLoan.builder()
                .institutionName(request.getInstitutionName())
                .institutionType(request.getInstitutionType())
                .loanBalance(request.getLoanBalance())
                .monthlyRepaymentAmount(request.getMonthlyRepaymentAmount())
                .endDate(request.getEndDate())
                .userId(userId)
                .build();

        return systemLoanRepository.save(loan);
    }

    public Mono<SystemLoan> getSystemLoanById(UUID id, UUID userId) {
        return systemLoanRepository.findSystemLoanById(id)
                .filter(loan -> loan.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Loan not found or access denied")));
    }

    public Flux<SystemLoan> getAllSystemLoans(UUID userId) {
        return systemLoanRepository.findAllSystemLoansByUserId(userId);
    }

    public Mono<SystemLoan> updateSystemLoan(UUID id, LoanRequest request, UUID userId) {
        return systemLoanRepository.findSystemLoanById(id)
                .filter(loan -> loan.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Loan not found or access denied")))
                .flatMap(existingLoan -> {
                    existingLoan.setInstitutionName(request.getInstitutionName());
                    existingLoan.setInstitutionType(request.getInstitutionType());
                    existingLoan.setLoanBalance(request.getLoanBalance());
                    existingLoan.setMonthlyRepaymentAmount(request.getMonthlyRepaymentAmount());
                    existingLoan.setEndDate(request.getEndDate());
                    return systemLoanRepository.save(existingLoan);
                });
    }

    public Mono<Void> deleteSystemLoan(UUID id, UUID userId) {
        return systemLoanRepository.findSystemLoanById(id)
                .filter(loan -> loan.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Loan not found or access denied")))
                .flatMap(loan -> systemLoanRepository.deleteSystemLoanById(id));
    }
}