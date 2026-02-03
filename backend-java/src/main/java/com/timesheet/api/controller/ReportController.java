package com.timesheet.api.controller;

import com.timesheet.api.dto.ErrorResponse;
import com.timesheet.api.dto.ReportResponse;
import com.timesheet.api.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/client/{clientId}")
    public ResponseEntity<?> getClientReport(@PathVariable Long clientId, Authentication authentication) {
        String userEmail = (String) authentication.getPrincipal();
        
        Optional<ReportResponse> reportOpt = reportService.getClientReport(clientId, userEmail);
        if (reportOpt.isPresent()) {
            return ResponseEntity.ok(reportOpt.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("Client not found"));
    }

    @GetMapping("/export/csv/{clientId}")
    public ResponseEntity<?> exportCsv(@PathVariable Long clientId, Authentication authentication) {
        String userEmail = (String) authentication.getPrincipal();
        
        Optional<byte[]> csvOpt = reportService.exportCsv(clientId, userEmail);
        if (csvOpt.isPresent()) {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", "report-" + clientId + ".csv");
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvOpt.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("Client not found"));
    }

    @GetMapping("/export/pdf/{clientId}")
    public ResponseEntity<?> exportPdf(@PathVariable Long clientId, Authentication authentication) {
        String userEmail = (String) authentication.getPrincipal();
        
        Optional<byte[]> pdfOpt = reportService.exportPdf(clientId, userEmail);
        if (pdfOpt.isPresent()) {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "report-" + clientId + ".pdf");
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfOpt.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("Client not found"));
    }
}
