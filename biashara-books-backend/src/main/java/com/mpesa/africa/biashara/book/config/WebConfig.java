package com.mpesa.africa.biashara.book.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.config.ResourceHandlerRegistry;
import org.springframework.web.reactive.config.WebFluxConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebFluxConfigurer {

    @Value("${app.upload.dir:uploads/photos}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absolutePath = Paths.get(uploadDir).toAbsolutePath().toString();
        registry.addResourceHandler("/uploads/photos/**")
                .addResourceLocations("file:" + absolutePath + "/");
    }
}
