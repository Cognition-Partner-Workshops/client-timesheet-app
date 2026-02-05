package com.tasktracker.controller;

import com.tasktracker.dto.BucketDTO;
import com.tasktracker.service.BucketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buckets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BucketController {

    private final BucketService bucketService;

    @GetMapping
    public ResponseEntity<List<BucketDTO>> getAllBuckets() {
        List<BucketDTO> buckets = bucketService.getAllBucketsWithTasks();
        return ResponseEntity.ok(buckets);
    }
}
