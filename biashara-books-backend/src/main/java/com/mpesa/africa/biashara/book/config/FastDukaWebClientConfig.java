package com.mpesa.africa.biashara.book.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class FastDukaWebClientConfig {

    @Bean(name = "fastDukaWebClient")
    public WebClient fastDukaWebClient(WebClient.Builder builder) {
        return builder
                .baseUrl("https://api.fastduka.co.ke")
                .build();
    }
}
