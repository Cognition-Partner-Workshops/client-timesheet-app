package com.tasktracker.service;

import com.tasktracker.dto.BucketDTO;
import com.tasktracker.dto.TaskDTO;
import com.tasktracker.model.Bucket;
import com.tasktracker.model.Task;
import com.tasktracker.repository.BucketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BucketService {

    private final BucketRepository bucketRepository;

    @Transactional(readOnly = true)
    public List<BucketDTO> getAllBucketsWithTasks() {
        List<Bucket> buckets = bucketRepository.findAllByOrderByPositionAsc();
        return buckets.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Bucket getBucketById(Long id) {
        return bucketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bucket not found with id: " + id));
    }

    private BucketDTO convertToDTO(Bucket bucket) {
        BucketDTO dto = new BucketDTO();
        dto.setId(bucket.getId());
        dto.setName(bucket.getName());
        dto.setPosition(bucket.getPosition());
        dto.setTasks(bucket.getTasks().stream()
                .map(this::convertTaskToDTO)
                .collect(Collectors.toList()));
        return dto;
    }

    private TaskDTO convertTaskToDTO(Task task) {
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
