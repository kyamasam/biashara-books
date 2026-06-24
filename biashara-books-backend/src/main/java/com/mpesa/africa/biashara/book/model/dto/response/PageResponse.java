package com.mpesa.africa.biashara.book.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Paginated response metadata and content.")
public class PageResponse<T> {
    @Schema(description = "Items in the requested page.")
    private List<T> content;

    @Schema(description = "Zero-based page number.", example = "0")
    private int page;

    @Schema(description = "Requested page size after server bounds are applied.", example = "20")
    private int size;

    @Schema(description = "Total number of matching records.", example = "125")
    private long totalElements;

    @Schema(description = "Total number of pages.", example = "7")
    private int totalPages;

    @Schema(description = "Whether this is the first page.", example = "true")
    private boolean first;

    @Schema(description = "Whether this is the last page.", example = "false")
    private boolean last;

    @Schema(description = "Whether this page contains no records.", example = "false")
    private boolean empty;

    public static <T> PageResponse<T> from(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .empty(page.isEmpty())
                .build();
    }
}
