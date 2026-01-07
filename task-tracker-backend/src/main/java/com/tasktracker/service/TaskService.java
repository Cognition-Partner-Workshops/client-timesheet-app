package com.tasktracker.service;

import com.tasktracker.dto.*;
import com.tasktracker.model.Bucket;
import com.tasktracker.model.Task;
import com.tasktracker.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final BucketService bucketService;

    @Transactional(readOnly = true)
    public List<TaskDTO> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskDTO getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        return convertToDTO(task);
    }

    @Transactional
    public TaskDTO createTask(CreateTaskRequest request) {
        Bucket bucket = bucketService.getBucketById(request.getBucketId());
        
        Integer maxPosition = taskRepository.findMaxPositionByBucketId(bucket.getId());
        
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setAssignedTo(request.getAssignedTo());
        task.setPriority(request.getPriority());
        task.setStartedOn(request.getStartedOn());
        task.setDueDate(request.getDueDate());
        task.setActualEndDate(request.getActualEndDate());
        task.setBucket(bucket);
        task.setPosition(maxPosition + 1);
        
        Task savedTask = taskRepository.save(task);
        return convertToDTO(savedTask);
    }

    @Transactional
    public TaskDTO updateTask(Long id, UpdateTaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        
        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getAssignedTo() != null) {
            task.setAssignedTo(request.getAssignedTo());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getStartedOn() != null) {
            task.setStartedOn(request.getStartedOn());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        if (request.getActualEndDate() != null) {
            task.setActualEndDate(request.getActualEndDate());
        }
        if (request.getBucketId() != null && !request.getBucketId().equals(task.getBucket().getId())) {
            Bucket newBucket = bucketService.getBucketById(request.getBucketId());
            Integer maxPosition = taskRepository.findMaxPositionByBucketId(newBucket.getId());
            task.setBucket(newBucket);
            task.setPosition(maxPosition + 1);
        }
        
        Task savedTask = taskRepository.save(task);
        return convertToDTO(savedTask);
    }

    @Transactional
    public TaskDTO moveTask(Long id, MoveTaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        
        Long sourceBucketId = task.getBucket().getId();
        Integer sourcePosition = task.getPosition();
        Long targetBucketId = request.getTargetBucketId();
        Integer targetPosition = request.getTargetPosition();
        
        if (sourceBucketId.equals(targetBucketId)) {
            if (sourcePosition < targetPosition) {
                taskRepository.decrementPositionsAfter(sourceBucketId, sourcePosition);
                taskRepository.incrementPositionsFrom(targetBucketId, targetPosition);
            } else if (sourcePosition > targetPosition) {
                taskRepository.decrementPositionsAfter(sourceBucketId, sourcePosition);
                taskRepository.incrementPositionsFrom(targetBucketId, targetPosition);
            }
        } else {
            taskRepository.decrementPositionsAfter(sourceBucketId, sourcePosition);
            taskRepository.incrementPositionsFrom(targetBucketId, targetPosition);
            Bucket targetBucket = bucketService.getBucketById(targetBucketId);
            task.setBucket(targetBucket);
        }
        
        task.setPosition(targetPosition);
        Task savedTask = taskRepository.save(task);
        return convertToDTO(savedTask);
    }

    @Transactional
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        
        Long bucketId = task.getBucket().getId();
        Integer position = task.getPosition();
        
        taskRepository.delete(task);
        taskRepository.decrementPositionsAfter(bucketId, position);
    }

    private TaskDTO convertToDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setAssignedTo(task.getAssignedTo());
        dto.setPriority(task.getPriority());
        dto.setStartedOn(task.getStartedOn());
        dto.setDueDate(task.getDueDate());
        dto.setActualEndDate(task.getActualEndDate());
        dto.setPosition(task.getPosition());
        dto.setBucketId(task.getBucket().getId());
        dto.setBucketName(task.getBucket().getName());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        return dto;
    }
}
