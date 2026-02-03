package com.timesheet.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private ClientInfo client;
    private List<WorkEntryInfo> workEntries;
    private BigDecimal totalHours;
    private int entryCount;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClientInfo {
        private Long id;
        private String name;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkEntryInfo {
        private Long id;
        private BigDecimal hours;
        private String description;
        private String date;
        private String created_at;
        private String updated_at;
    }
}
