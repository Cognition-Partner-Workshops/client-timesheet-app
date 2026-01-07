package com.tasktracker.repository;

import com.tasktracker.model.Bucket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BucketRepository extends JpaRepository<Bucket, Long> {
    List<Bucket> findAllByOrderByPositionAsc();
}
