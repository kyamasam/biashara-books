package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.request.ExpenseTypeRequest;
import com.mpesa.africa.biashara.book.model.entity.*;
import com.mpesa.africa.biashara.book.repository.ExpenseTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpenseTypeService {

    private final ExpenseTypeRepository expenseTypeRepository;

    public Mono<ExpenseType> createExpenseType(ExpenseTypeRequest request) {
        log.info("Creating expense type: {}", request.getName());

        return expenseTypeRepository.existsByName(request.getName())
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.error(new CustomException("Expense type with this name already exists"));
                    }
                    ExpenseType expenseType = ExpenseType.builder()
                            .name(request.getName())
                            .build();
                    return expenseTypeRepository.save(expenseType);
                });
    }

    public Mono<ExpenseType> getExpenseTypeById(UUID id) {
        return expenseTypeRepository.findById(id)
                .switchIfEmpty(Mono.error(new CustomException("Expense type not found")));
    }

    public Flux<ExpenseType> getAllExpenseTypes() {
        return expenseTypeRepository.findAll();
    }

    public Flux<ExpenseType> searchExpenseTypes(String name) {
        return expenseTypeRepository.findByNameContaining(name);
    }

    public Mono<ExpenseType> updateExpenseType(UUID id, ExpenseTypeRequest request) {
        return expenseTypeRepository.findById(id)
                .switchIfEmpty(Mono.error(new CustomException("Expense type not found")))
                .flatMap(existingType -> {
                    existingType.setName(request.getName());
                    return expenseTypeRepository.save(existingType);
                });
    }

    public Mono<Void> deleteExpenseType(UUID id) {
        return expenseTypeRepository.findById(id)
                .switchIfEmpty(Mono.error(new CustomException("Expense type not found")))
                .flatMap(expenseTypeRepository::delete);
    }
}
