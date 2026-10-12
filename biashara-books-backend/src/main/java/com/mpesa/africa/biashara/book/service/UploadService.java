package com.mpesa.africa.biashara.book.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Service
public class UploadService {

    private final Path uploadDir;
    private final String baseUrl;

    public UploadService(
            @Value("${app.upload.dir:uploads/photos}") String uploadDir,
            @Value("${app.upload.base-url:http://localhost:8080/uploads/photos}") String baseUrl) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath();
        this.baseUrl = baseUrl;
        ensureUploadDirExists(this.uploadDir);
    }

    public Mono<String> savePhoto(FilePart file) {
        String originalFilename = file.filename();
        String extension = getExtension(originalFilename);
        String filename = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);
        Path destination = uploadDir.resolve(filename);

        return file.transferTo(destination)
                .then(Mono.fromCallable(() -> {
                    String url = baseUrl + "/" + filename;
                    log.info("Photo URL returned to client: {}", url);
                    return url;
                }))
                .subscribeOn(Schedulers.boundedElastic())
                .doOnSuccess(url -> log.info("Saved photo: {}", url))
                .doOnError(e -> log.error("Failed to save photo: {}", e.getMessage()));
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    private void ensureUploadDirExists(Path dir) {
        try {
            Files.createDirectories(dir);
            log.info("Upload directory: {}", dir);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot create upload directory: " + dir, e);
        }
    }
}
