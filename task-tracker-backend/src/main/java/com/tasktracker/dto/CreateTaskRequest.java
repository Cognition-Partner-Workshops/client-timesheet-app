package com.tasktracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTaskRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must be less than 200 characters")
    private String title;
    
    private String description;
    
    private String assignedTo;
    
    private String priority;
    
    private LocalDate startedOn;
    
    private LocalDate dueDate;
    
    private LocalDate actualEndDate;
    
    @NotNull(message = "Bucket ID is required")
    private Long bucketId;
}
