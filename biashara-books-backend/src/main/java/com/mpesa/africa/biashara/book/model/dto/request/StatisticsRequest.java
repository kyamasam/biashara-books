package com.mpesa.africa.biashara.book.model.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsRequest {
    private String period;  // "today", "week", "month", "3months", "6months", "year"
    private String startDate;
    private String endDate;
}