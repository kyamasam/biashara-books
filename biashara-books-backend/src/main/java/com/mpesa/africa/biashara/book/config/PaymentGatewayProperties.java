package com.mpesa.africa.biashara.book.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "payment.gateway.fastduka")
public class PaymentGatewayProperties {
    private String baseUrl = "https://api.fastduka.co.ke/api";
    private String apiKey;
    private String paybill;
    private String orgId;
    private String configId;
    private int maxPollAttempts = 10;
    private int pollIntervalSeconds = 5;
    private int maxAmount = 250000;
}