package com.mpesa.africa.biashara.book.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.r2dbc.postgresql.codec.Json;
import io.r2dbc.spi.ConnectionFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;
import org.springframework.data.r2dbc.convert.R2dbcCustomConversions;
import org.springframework.data.r2dbc.dialect.DialectResolver;

import java.io.UncheckedIOException;
import java.util.List;
import java.util.Map;

@Configuration
public class R2dbcConfig {

    @Bean
    R2dbcCustomConversions r2dbcCustomConversions(
            ConnectionFactory connectionFactory,
            ObjectMapper objectMapper
    ) {
        return R2dbcCustomConversions.of(
                DialectResolver.getDialect(connectionFactory),
                List.of(
                        new MapToJsonConverter(objectMapper),
                        new JsonToMapConverter(objectMapper)
                )
        );
    }

    @WritingConverter
    @RequiredArgsConstructor
    static class MapToJsonConverter implements Converter<Map<String, Object>, Json> {
        private final ObjectMapper objectMapper;

        @Override
        public Json convert(Map<String, Object> source) {
            try {
                return Json.of(objectMapper.writeValueAsString(source));
            } catch (com.fasterxml.jackson.core.JsonProcessingException ex) {
                throw new IllegalArgumentException("Unable to serialize JSONB value", ex);
            }
        }
    }

    @ReadingConverter
    @RequiredArgsConstructor
    static class JsonToMapConverter implements Converter<Json, Map<String, Object>> {
        private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
        };

        private final ObjectMapper objectMapper;

        @Override
        public Map<String, Object> convert(Json source) {
            try {
                return objectMapper.readValue(source.asString(), MAP_TYPE);
            } catch (java.io.IOException ex) {
                throw new UncheckedIOException("Unable to deserialize JSONB value", ex);
            }
        }
    }
}
