package com.tasktracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskDTO {
    private Long id;
    private String title;
    private String description;
    private String assignedTo;
    private String priority;
    private LocalDate startedOn;
    private LocalDate dueDate;
    private LocalDate actualEndDate;
    private Integer position;
    private Long bucketId;
    private String bucketName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
