package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.response.BusinessScoreResponse;
import com.mpesa.africa.biashara.book.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusinessScoreService {

    // Benchmarks — the amount at which a component contributes its full weight.
    private static final BigDecimal SALES_BENCHMARK = new BigDecimal("100000");
    private static final BigDecimal TX_BENCHMARK = new BigDecimal("50000");
    private static final BigDecimal LOAN_MULTIPLIER = new BigDecimal("3.0");

    // Component weights (must sum to 1.0)
    private static final BigDecimal WEIGHT_SALES = new BigDecimal("0.35");
    private static final BigDecimal WEIGHT_TX = new BigDecimal("0.25");
    private static final BigDecimal WEIGHT_EXPENSE = new BigDecimal("0.25");
    private static final BigDecimal WEIGHT_LOAN = new BigDecimal("0.15");

    private final SalesRepository salesRepository;
    private final TransactionRepository transactionRepository;
    private final ExpenseRepository expenseRepository;
    private final LoanRepository loanRepository;
    private final SystemLoanRepository systemLoanRepository;
    private final UserRepository userRepository;

    public Mono<BusinessScoreResponse> calculateScore(UUID userId, int periodMonths) {
        LocalDateTime periodEnd = LocalDateTime.now();
        LocalDateTime periodStart = periodEnd.minusMonths(periodMonths);

        return resolveBusinessId(userId)
                .flatMap(businessId -> fetchAggregates(userId, businessId, periodStart, periodEnd)
                        .map(agg -> buildResponse(businessId, agg, periodMonths, periodStart, periodEnd)));
    }

    private Mono<UUID> resolveBusinessId(UUID userId) {
        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new CustomException("User not found")))
                .flatMap(user -> Mono.justOrEmpty(user.getCurrentBusinessId())
                        .switchIfEmpty(Mono.error(new CustomException("No current business set"))));
    }

    private Mono<Aggregates> fetchAggregates(UUID userId, UUID businessId,
                                              LocalDateTime start, LocalDateTime end) {
        Mono<BigDecimal> salesMono = salesRepository
                .sumCompletedTotalByUserIdAndDateRange(userId, start, end)
                .defaultIfEmpty(BigDecimal.ZERO);

        Mono<BigDecimal> txMono = transactionRepository
                .sumCompletedAmountByBusinessIdAndDateRange(businessId, start, end)
                .defaultIfEmpty(BigDecimal.ZERO);

        Mono<BigDecimal> expenseMono = expenseRepository
                .sumCompletedExpenseAmountByBusinessIdAndDateRange(businessId, start, end)
                .defaultIfEmpty(BigDecimal.ZERO);

        Mono<BigDecimal> otherLoanMono = loanRepository
                .sumLoanBalanceByUserId(userId)
                .defaultIfEmpty(BigDecimal.ZERO);

        Mono<BigDecimal> systemLoanMono = systemLoanRepository
                .sumLoanBalanceByBusinessId(businessId)
                .defaultIfEmpty(BigDecimal.ZERO);

        return Mono.zip(salesMono, txMono, expenseMono, otherLoanMono, systemLoanMono)
                .map(t -> new Aggregates(t.getT1(), t.getT2(), t.getT3(), t.getT4().add(t.getT5())));
    }

    private BusinessScoreResponse buildResponse(UUID businessId, Aggregates agg,
                                                 int periodMonths, LocalDateTime start, LocalDateTime end) {
        BigDecimal sales = agg.salesTotal;
        BigDecimal tx = agg.transactionsSum;
        BigDecimal expenses = agg.expenses;
        BigDecimal loans = agg.otherLoansTotal;

        // Normalised signals (capped at 1.0)
        BigDecimal normSales = sales.divide(SALES_BENCHMARK, 10, RoundingMode.HALF_UP).min(BigDecimal.ONE);
        BigDecimal normTx = tx.divide(TX_BENCHMARK, 10, RoundingMode.HALF_UP).min(BigDecimal.ONE);

        // Ratio signals (0..1, lower is better for expenses/loans)
        BigDecimal salesFloor = sales.max(BigDecimal.ONE);
        BigDecimal expenseRatio = expenses.divide(salesFloor, 10, RoundingMode.HALF_UP).min(BigDecimal.ONE);
        BigDecimal loanBurden = loans.divide(salesFloor, 10, RoundingMode.HALF_UP).min(BigDecimal.ONE);

        // Component scores (0..1 each)
        BigDecimal salesScore = normSales;
        BigDecimal txScore = normTx;
        BigDecimal expenseScore = BigDecimal.ONE.subtract(expenseRatio).max(BigDecimal.ZERO);
        BigDecimal loanScore = BigDecimal.ONE.subtract(loanBurden).max(BigDecimal.ZERO);

        // Weighted raw score (0..1)
        BigDecimal rawScore = salesScore.multiply(WEIGHT_SALES)
                .add(txScore.multiply(WEIGHT_TX))
                .add(expenseScore.multiply(WEIGHT_EXPENSE))
                .add(loanScore.multiply(WEIGHT_LOAN));

        BigDecimal score = rawScore.multiply(new BigDecimal("100"))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal loanLimit = sales.multiply(LOAN_MULTIPLIER)
                .multiply(rawScore)
                .setScale(2, RoundingMode.HALF_UP);

        // Breakdown: each component's contribution to the final 0–100 score
        Map<String, BigDecimal> breakdown = Map.of(
                "sales", salesScore.multiply(WEIGHT_SALES).multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP),
                "transactions", txScore.multiply(WEIGHT_TX).multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP),
                "expenses", expenseScore.multiply(WEIGHT_EXPENSE).multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP),
                "loans", loanScore.multiply(WEIGHT_LOAN).multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP)
        );

        log.info("Business {} scored {} with loan limit {}", businessId, score, loanLimit);

        return BusinessScoreResponse.builder()
                .businessId(businessId)
                .score(score)
                .loanLimit(loanLimit)
                .salesTotal(sales)
                .transactionsSum(tx)
                .expenses(expenses)
                .otherLoansTotal(loans)
                .breakdown(breakdown)
                .periodMonths(periodMonths)
                .periodStart(start)
                .periodEnd(end)
                .build();
    }

    private record Aggregates(
            BigDecimal salesTotal,
            BigDecimal transactionsSum,
            BigDecimal expenses,
            BigDecimal otherLoansTotal
    ) {}
}
