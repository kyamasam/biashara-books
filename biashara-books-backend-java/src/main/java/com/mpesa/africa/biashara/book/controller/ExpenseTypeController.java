package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.model.dto.request.ExpenseTypeRequest;
import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.model.entity.ExpenseType;
import com.mpesa.africa.biashara.book.service.ExpenseTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/expense-types")
@RequiredArgsConstructor
public class ExpenseTypeController {

    private final ExpenseTypeService expenseTypeService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<ExpenseType>> createExpenseType(
            @Valid @RequestBody ExpenseTypeRequest request) {
        log.info("Creating expense type: {}", request.getName());
        return expenseTypeService.createExpenseType(request)
                .map(type -> ApiResponse.success(type, "Expense type created successfully"));
    }

    @GetMapping("/{id}")
    public Mono<ApiResponse<ExpenseType>> getExpenseTypeById(@PathVariable UUID id) {
        log.info("Fetching expense type: {}", id);
        return expenseTypeService.getExpenseTypeById(id)
                .map(type -> ApiResponse.success(type, "Expense type retrieved successfully"));
    }

    @GetMapping
    public Mono<ApiResponse<List<ExpenseType>>> getAllExpenseTypes() {
        log.info("Fetching all expense types");
        return expenseTypeService.getAllExpenseTypes()
                .collectList()
                .map(types -> ApiResponse.success(types, "Expense types retrieved successfully"));
    }

    @GetMapping("/search")
    public Mono<ApiResponse<List<ExpenseType>>> searchExpenseTypes(@RequestParam String name) {
        log.info("Searching expense types with name: {}", name);
        return expenseTypeService.searchExpenseTypes(name)
                .collectList()
                .map(types -> ApiResponse.success(types, "Expense types retrieved successfully"));
    }

    @PutMapping("/{id}")
    public Mono<ApiResponse<ExpenseType>> updateExpenseType(
            @PathVariable UUID id,
            @Valid @RequestBody ExpenseTypeRequest request) {
        log.info("Updating expense type: {}", id);
        return expenseTypeService.updateExpenseType(id, request)
                .map(type -> ApiResponse.success(type, "Expense type updated successfully"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<ApiResponse<Void>> deleteExpenseType(@PathVariable UUID id) {
        log.info("Deleting expense type: {}", id);
        return expenseTypeService.deleteExpenseType(id)
                .then(Mono.just(ApiResponse.<Void>success(null, "Expense type deleted successfully")));
    }
}