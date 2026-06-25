package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.request.ExpenseRequest;
import com.mpesa.africa.biashara.book.model.dto.request.MpesaB2BPaymentRequest;
import com.mpesa.africa.biashara.book.model.dto.request.TransactionRequest;
import com.mpesa.africa.biashara.book.model.dto.response.MpesaB2BPaymentResponse;
import com.mpesa.africa.biashara.book.model.entity.Expense;
import com.mpesa.africa.biashara.book.model.entity.Transaction;
import com.mpesa.africa.biashara.book.model.enums.ExpensePaymentMethod;
import com.mpesa.africa.biashara.book.model.enums.ExpenseStatus;
import com.mpesa.africa.biashara.book.model.enums.PaymentChannel;
import com.mpesa.africa.biashara.book.model.enums.TransactionMethod;
import com.mpesa.africa.biashara.book.model.enums.TransactionPurpose;
import com.mpesa.africa.biashara.book.model.enums.TransactionStatus;
import com.mpesa.africa.biashara.book.model.enums.TransactionType;
import com.mpesa.africa.biashara.book.repository.ExpenseRepository;
import com.mpesa.africa.biashara.book.repository.ExpenseTypeRepository;
import com.mpesa.africa.biashara.book.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseTypeRepository expenseTypeRepository;
    private final UserRepository userRepository;
    private final TransactionService transactionService;
    private final B2BPaymentService b2BPaymentService;

    public Mono<Expense> createExpense(ExpenseRequest request, UUID userId) {
        ExpensePaymentMethod paymentMethod = request.getPaymentMethod() == null
                ? ExpensePaymentMethod.cash
                : request.getPaymentMethod();

        log.info("Creating expense for user: {}, paymentMethod: {}", userId, paymentMethod);

        return resolveBusinessId(userId)
                .flatMap(businessId -> expenseTypeRepository.findById(request.getExpenseTypeId())
                        .switchIfEmpty(Mono.error(new CustomException("Expense type not found")))
                        .flatMap(expenseType -> paymentMethod == ExpensePaymentMethod.mpesa
                                ? createMpesaExpense(request, userId, businessId)
                                : createCashExpense(request, userId, businessId)));
    }

    private Mono<Expense> createCashExpense(ExpenseRequest request, UUID userId, UUID businessId) {
        TransactionRequest txReq = TransactionRequest.builder()
                .businessId(businessId)
                .transactionType(TransactionType.debit)
                .transactionMethod(TransactionMethod.cash)
                .transactionPurpose(TransactionPurpose.expense_payment)
                .transactionPurposeDetail(resolvePurposeDetail(request, "Cash expense payment"))
                .transactionAmount(request.getExpenseAmount())
                .paymentChannel(PaymentChannel.cash)
                .receiverName(request.getOtherName())
                .build();

        return transactionService.createTransaction(txReq, userId)
                .flatMap(tx -> transactionService.updateTransactionStatus(
                        tx.getId(), TransactionStatus.success, "Cash expense payment completed", userId))
                .flatMap(tx -> saveExpense(request, userId, businessId, tx.getId(),
                        ExpensePaymentMethod.cash, ExpenseStatus.completed, null));
    }

    private Mono<Expense> createMpesaExpense(ExpenseRequest request, UUID userId, UUID businessId) {
        TransactionRequest txReq = TransactionRequest.builder()
                .businessId(businessId)
                .transactionType(TransactionType.debit)
                .transactionMethod(TransactionMethod.b2b)
                .transactionPurpose(TransactionPurpose.expense_payment)
                .transactionPurposeDetail(resolvePurposeDetail(request, "M-PESA paybill expense payment"))
                .transactionAmount(request.getExpenseAmount())
                .paymentChannel(PaymentChannel.paybill)
                .receiverAccount(request.getDestinationPaybill())
                .receiverNumber(request.getDestinationPaybill())
                .senderNumber(request.getRequester())
                .build();

        return transactionService.createTransaction(txReq, userId)
                .flatMap(tx -> b2BPaymentService.initiatePaybillPayment(buildB2BRequest(request), userId)
                        .flatMap(response -> updateB2BTransaction(tx, response, userId)
                                .flatMap(updatedTx -> saveExpense(request, userId, businessId, updatedTx.getId(),
                                        ExpensePaymentMethod.mpesa, ExpenseStatus.pending, response.getConversationId())))
                        .onErrorResume(error -> transactionService.updateTransactionStatus(
                                        tx.getId(), TransactionStatus.failed, error.getMessage(), userId)
                                .then(Mono.error(error))));
    }

    private MpesaB2BPaymentRequest buildB2BRequest(ExpenseRequest request) {
        return MpesaB2BPaymentRequest.builder()
                .sourceAccountId(request.getSourceAccountId())
                .amount(request.getExpenseAmount())
                .destinationPaybill(request.getDestinationPaybill())
                .accountReference(request.getAccountReference())
                .remarks(resolveRemarks(request))
                .requester(request.getRequester())
                .build();
    }

    private Mono<Transaction> updateB2BTransaction(Transaction tx, MpesaB2BPaymentResponse response, UUID userId) {
        return transactionService.updateTransactionPaymentResult(
                tx.getId(),
                TransactionStatus.initiated,
                "M-PESA B2B paybill payment initiated",
                response.getConversationId(),
                toCallbackMap(response),
                userId
        );
    }

    private Mono<Expense> saveExpense(ExpenseRequest request, UUID userId, UUID businessId, UUID transactionId,
                                      ExpensePaymentMethod paymentMethod, ExpenseStatus expenseStatus,
                                      String b2bConversationId) {
        Expense expense = Expense.builder()
                .expenseTypeId(request.getExpenseTypeId())
                .otherName(request.getOtherName())
                .expenseAmount(request.getExpenseAmount())
                .transactionId(transactionId)
                .paymentMethod(paymentMethod)
                .expenseStatus(expenseStatus)
                .b2bConversationId(b2bConversationId)
                .userId(userId)
                .businessId(businessId)
                .build();
        return expenseRepository.save(expense);
    }

    public Mono<Expense> getExpenseById(UUID id, UUID userId) {
        return resolveBusinessId(userId)
                .flatMap(businessId -> expenseRepository.findById(id)
                        .filter(expense -> businessId.equals(expense.getBusinessId()))
                        .switchIfEmpty(Mono.error(new CustomException("Expense not found or access denied"))));
    }

    public Flux<Expense> getAllExpenses(UUID userId) {
        return resolveBusinessId(userId)
                .flatMapMany(expenseRepository::findByBusinessId);
    }

    public Flux<Expense> getExpensesByType(UUID expenseTypeId, UUID userId) {
        return resolveBusinessId(userId)
                .flatMapMany(businessId -> expenseRepository.findByBusinessIdAndExpenseTypeId(businessId, expenseTypeId));
    }

    public Mono<Expense> updateExpense(UUID id, ExpenseRequest request, UUID userId) {
        return resolveBusinessId(userId)
                .flatMap(businessId -> expenseRepository.findById(id)
                        .filter(expense -> businessId.equals(expense.getBusinessId()))
                        .switchIfEmpty(Mono.error(new CustomException("Expense not found or access denied")))
                        .flatMap(existingExpense -> {
                            existingExpense.setExpenseTypeId(request.getExpenseTypeId());
                            existingExpense.setOtherName(request.getOtherName());
                            existingExpense.setExpenseAmount(request.getExpenseAmount());
                            existingExpense.setTransactionId(request.getTransactionId());
                            if (request.getPaymentMethod() != null) {
                                existingExpense.setPaymentMethod(request.getPaymentMethod());
                            }
                            return expenseRepository.save(existingExpense);
                        }));
    }

    public Mono<Void> deleteExpense(UUID id, UUID userId) {
        return resolveBusinessId(userId)
                .flatMap(businessId -> expenseRepository.findById(id)
                        .filter(expense -> businessId.equals(expense.getBusinessId()))
                        .switchIfEmpty(Mono.error(new CustomException("Expense not found or access denied")))
                        .flatMap(expenseRepository::delete));
    }

    public Mono<Double> getTotalExpenses(UUID userId) {
        return resolveBusinessId(userId)
                .flatMap(businessId -> expenseRepository.sumExpenseAmountByBusinessId(businessId)
                        .defaultIfEmpty(0.0));
    }

    private Mono<UUID> resolveBusinessId(UUID userId) {
        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new CustomException("User not found")))
                .flatMap(user -> Mono.justOrEmpty(user.getCurrentBusinessId())
                        .switchIfEmpty(Mono.error(new CustomException("No current business set"))));
    }

    private String resolvePurposeDetail(ExpenseRequest request, String fallback) {
        return request.getOtherName() == null || request.getOtherName().isBlank()
                ? fallback
                : request.getOtherName();
    }

    private String resolveRemarks(ExpenseRequest request) {
        return request.getRemarks() == null || request.getRemarks().isBlank()
                ? resolvePurposeDetail(request, "Expense payment")
                : request.getRemarks();
    }

    private Map<String, Object> toCallbackMap(MpesaB2BPaymentResponse response) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("provider", "mpesa_b2b");
        payload.put("id", response.getId());
        payload.put("conversationId", response.getConversationId());
        payload.put("originatorConversationId", response.getOriginatorConversationId());
        payload.put("status", response.getStatus());
        payload.put("mpesaCode", response.getMpesaCode());
        payload.put("resultDescription", response.getResultDescription());
        payload.put("success", response.getSuccess());
        payload.put("response", response.getResponse());
        return payload;
    }
}
