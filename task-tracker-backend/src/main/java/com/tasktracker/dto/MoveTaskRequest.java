package com.tasktracker.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MoveTaskRequest {
    @NotNull(message = "Target bucket ID is required")
    private Long targetBucketId;
    
    @NotNull(message = "Target position is required")
    private Integer targetPosition;
}
