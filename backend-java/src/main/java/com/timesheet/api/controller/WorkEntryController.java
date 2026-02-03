package com.timesheet.api.controller;

import com.timesheet.api.dto.ErrorResponse;
import com.timesheet.api.dto.WorkEntryRequest;
import com.timesheet.api.dto.WorkEntryResponse;
import com.timesheet.api.service.WorkEntryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/work-entries")
@RequiredArgsConstructor
public class WorkEntryController {

    private final WorkEntryService workEntryService;

    @GetMapping
    public ResponseEntity<Map<String, List<WorkEntryResponse>>> getAllWorkEntries(
            @RequestParam(required = false) Long clientId,
            Authentication authentication) {
        String userEmail = (String) authentication.getPrincipal();
        List<WorkEntryResponse> entries = workEntryService.getAllWorkEntries(userEmail, clientId);
        
        Map<String, List<WorkEntryResponse>> response = new HashMap<>();
        response.put("workEntries", entries);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getWorkEntryById(@PathVariable Long id, Authentication authentication) {
        String userEmail = (String) authentication.getPrincipal();
        
        Optional<WorkEntryResponse> entryOpt = workEntryService.getWorkEntryById(id, userEmail);
        if (entryOpt.isPresent()) {
            Map<String, WorkEntryResponse> response = new HashMap<>();
            response.put("workEntry", entryOpt.get());
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("Work entry not found"));
    }

    @PostMapping
    public ResponseEntity<?> createWorkEntry(
            @Valid @RequestBody WorkEntryRequest request,
            Authentication authentication) {
        String userEmail = (String) authentication.getPrincipal();
        
        Optional<WorkEntryResponse> entryOpt = workEntryService.createWorkEntry(request, userEmail);
        if (entryOpt.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Work entry created successfully");
            response.put("workEntry", entryOpt.get());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("Invalid client ID"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateWorkEntry(
            @PathVariable Long id,
            @Valid @RequestBody WorkEntryRequest request,
            Authentication authentication) {
        String userEmail = (String) authentication.getPrincipal();
        
        Optional<WorkEntryResponse> entryOpt = workEntryService.updateWorkEntry(id, request, userEmail);
        if (entryOpt.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Work entry updated successfully");
            response.put("workEntry", entryOpt.get());
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("Work entry not found or invalid client ID"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWorkEntry(@PathVariable Long id, Authentication authentication) {
        String userEmail = (String) authentication.getPrincipal();
        
        if (workEntryService.deleteWorkEntry(id, userEmail)) {
            return ResponseEntity.ok(Map.of("message", "Work entry deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("Work entry not found"));
    }
}
