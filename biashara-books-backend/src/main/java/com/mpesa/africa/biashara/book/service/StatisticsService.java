package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.model.dto.request.StatisticsRequest;
import com.mpesa.africa.biashara.book.model.dto.response.StatisticsResponse;
import com.mpesa.africa.biashara.book.repository.StatisticsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final StatisticsRepository statisticsRepository;
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public Mono<StatisticsResponse> getStatistics(UUID userId, StatisticsRequest request) {
        log.info("Fetching statistics for user: {} with period: {}", userId, request.getPeriod());

        // Calculate date range based on period
        DateRange dateRange = calculateDateRange(request);

        LocalDateTime startDate = dateRange.getStartDate();
        LocalDateTime endDate = dateRange.getEndDate();
        String periodLabel = dateRange.getPeriodLabel();

        return Mono.zip(
                statisticsRepository.countSalesByUserIdAndDateRange(userId, startDate, endDate),
                statisticsRepository.sumAmountPaidByUserIdAndDateRange(userId, startDate, endDate),
                statisticsRepository.sumCostOfGoodsSoldByUserIdAndDateRange(userId, startDate, endDate)
        ).map(tuple -> {
            Long salesVolume = tuple.getT1();
            BigDecimal moneyIn = tuple.getT2() != null ? tuple.getT2() : BigDecimal.ZERO;
            BigDecimal moneyOut = tuple.getT3() != null ? tuple.getT3() : BigDecimal.ZERO;
            BigDecimal profit = moneyIn.subtract(moneyOut);

            // Calculate profit margin (if moneyIn > 0)
            BigDecimal profitMargin = BigDecimal.ZERO;
            if (moneyIn.compareTo(BigDecimal.ZERO) > 0) {
                profitMargin = profit.divide(moneyIn, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(2, RoundingMode.HALF_UP);
            }

            return StatisticsResponse.builder()
                    .salesVolume(salesVolume.intValue())
                    .moneyIn(moneyIn.setScale(2, RoundingMode.HALF_UP))
                    .moneyOut(moneyOut.setScale(2, RoundingMode.HALF_UP))
                    .profit(profit.setScale(2, RoundingMode.HALF_UP))
                    .profitMargin(profitMargin)
                    .period(periodLabel)
                    .startDate(startDate.format(dateFormatter))
                    .endDate(endDate.format(dateFormatter))
                    .build();
        });
    }

    private DateRange calculateDateRange(StatisticsRequest request) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate;
        String periodLabel;

        // If custom dates are provided, use them
        if (request.getStartDate() != null && request.getEndDate() != null) {
            startDate = LocalDateTime.parse(request.getStartDate(), dateFormatter);
            endDate = LocalDateTime.parse(request.getEndDate(), dateFormatter);
            periodLabel = "custom";
            return new DateRange(startDate, endDate, periodLabel);
        }

        String period = request.getPeriod() != null ? request.getPeriod().toLowerCase() : "today";

        switch (period) {
            case "today":
                startDate = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
                periodLabel = "Today";
                break;
            case "week":
            case "thisweek":
                startDate = LocalDateTime.of(LocalDate.now().minusDays(7), LocalTime.MIN);
                periodLabel = "Last 7 Days";
                break;
            case "month":
            case "thismonth":
                startDate = LocalDateTime.of(LocalDate.now().minusDays(30), LocalTime.MIN);
                periodLabel = "Last 30 Days";
                break;
            case "3months":
            case "threemonths":
                startDate = LocalDateTime.of(LocalDate.now().minusDays(90), LocalTime.MIN);
                periodLabel = "Last 3 Months";
                break;
            case "6months":
            case "sixmonths":
                startDate = LocalDateTime.of(LocalDate.now().minusDays(180), LocalTime.MIN);
                periodLabel = "Last 6 Months";
                break;
            case "year":
            case "thisyear":
                startDate = LocalDateTime.of(LocalDate.now().minusDays(365), LocalTime.MIN);
                periodLabel = "Last Year";
                break;
            default:
                // Default to today
                startDate = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
                periodLabel = "Today";
                break;
        }

        return new DateRange(startDate, endDate, periodLabel);
    }

    // Inner class for date range
    private static class DateRange {
        private final LocalDateTime startDate;
        private final LocalDateTime endDate;
        private final String periodLabel;

        public DateRange(LocalDateTime startDate, LocalDateTime endDate, String periodLabel) {
            this.startDate = startDate;
            this.endDate = endDate;
            this.periodLabel = periodLabel;
        }

        public LocalDateTime getStartDate() { return startDate; }
        public LocalDateTime getEndDate() { return endDate; }
        public String getPeriodLabel() { return periodLabel; }
    }
}
