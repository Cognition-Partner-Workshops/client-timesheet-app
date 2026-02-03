package com.timesheet.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkEntryResponse {
    private Long id;
    private Long client_id;
    private BigDecimal hours;
    private String description;
    private String date;
    private String created_at;
    private String updated_at;
    private String client_name;
}
