package com.timesheet.api.service;

import com.timesheet.api.dto.WorkEntryRequest;
import com.timesheet.api.dto.WorkEntryResponse;
import com.timesheet.api.entity.WorkEntry;
import com.timesheet.api.repository.WorkEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkEntryService {

    private final WorkEntryRepository workEntryRepository;
    private final ClientService clientService;
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    public List<WorkEntryResponse> getAllWorkEntries(String userEmail, Long clientId) {
        List<WorkEntry> entries;
        if (clientId != null) {
            entries = workEntryRepository.findByUserEmailAndClientIdWithClient(userEmail, clientId);
        } else {
            entries = workEntryRepository.findByUserEmailWithClient(userEmail);
        }
        return entries.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public Optional<WorkEntryResponse> getWorkEntryById(Long id, String userEmail) {
        return workEntryRepository.findByIdAndUserEmail(id, userEmail)
                .map(this::toResponse);
    }

    @Transactional
    public Optional<WorkEntryResponse> createWorkEntry(WorkEntryRequest request, String userEmail) {
        if (!clientService.existsById(request.getClientId(), userEmail)) {
            return Optional.empty();
        }

        WorkEntry entry = WorkEntry.builder()
                .clientId(request.getClientId())
                .userEmail(userEmail)
                .hours(request.getHours())
                .description(request.getDescription())
                .date(LocalDate.parse(request.getDate(), DATE_FORMATTER))
                .build();

        WorkEntry saved = workEntryRepository.save(entry);
        
        return workEntryRepository.findById(saved.getId())
                .map(this::toResponse);
    }

    @Transactional
    public Optional<WorkEntryResponse> updateWorkEntry(Long id, WorkEntryRequest request, String userEmail) {
        if (!clientService.existsById(request.getClientId(), userEmail)) {
            return Optional.empty();
        }

        return workEntryRepository.findByIdAndUserEmail(id, userEmail)
                .map(entry -> {
                    entry.setClientId(request.getClientId());
                    entry.setHours(request.getHours());
                    entry.setDescription(request.getDescription());
                    entry.setDate(LocalDate.parse(request.getDate(), DATE_FORMATTER));
                    WorkEntry saved = workEntryRepository.save(entry);
                    return toResponse(saved);
                });
    }

    @Transactional
    public boolean deleteWorkEntry(Long id, String userEmail) {
        Optional<WorkEntry> entry = workEntryRepository.findByIdAndUserEmail(id, userEmail);
        if (entry.isPresent()) {
            workEntryRepository.delete(entry.get());
            return true;
        }
        return false;
    }

    private WorkEntryResponse toResponse(WorkEntry entry) {
        WorkEntryResponse.WorkEntryResponseBuilder builder = WorkEntryResponse.builder()
                .id(entry.getId())
                .client_id(entry.getClientId())
                .hours(entry.getHours())
                .description(entry.getDescription())
                .date(entry.getDate().format(DATE_FORMATTER))
                .created_at(entry.getCreatedAt().format(ISO_FORMATTER))
                .updated_at(entry.getUpdatedAt().format(ISO_FORMATTER));

        if (entry.getClient() != null) {
            builder.client_name(entry.getClient().getName());
        }

        return builder.build();
    }
}
