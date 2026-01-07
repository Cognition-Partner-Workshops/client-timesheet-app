package com.tasktracker.controller;

import com.tasktracker.dto.*;
import com.tasktracker.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskDTO>> getAllTasks() {
        List<TaskDTO> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable Long id) {
        TaskDTO task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }

    @PostMapping
    public ResponseEntity<TaskDTO> createTask(@Valid @RequestBody CreateTaskRequest request) {
        TaskDTO task = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(@PathVariable Long id, @Valid @RequestBody UpdateTaskRequest request) {
        TaskDTO task = taskService.updateTask(id, request);
        return ResponseEntity.ok(task);
    }

    @PutMapping("/{id}/move")
    public ResponseEntity<TaskDTO> moveTask(@PathVariable Long id, @Valid @RequestBody MoveTaskRequest request) {
        TaskDTO task = taskService.moveTask(id, request);
        return ResponseEntity.ok(task);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
