package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.service.UploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;

    @PostMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<ApiResponse<Map<String, String>>> uploadPhoto(@RequestPart("file") FilePart file) {
        log.info("Uploading photo: {}", file.filename());
        return uploadService.savePhoto(file)
                .map(url -> ApiResponse.success(Map.of("url", url), "Photo uploaded successfully"));
    }
}
