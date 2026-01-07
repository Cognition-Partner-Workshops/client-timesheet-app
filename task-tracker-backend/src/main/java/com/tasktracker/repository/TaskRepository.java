package com.tasktracker.repository;

import com.tasktracker.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByBucketIdOrderByPositionAsc(Long bucketId);
    
    @Query("SELECT COALESCE(MAX(t.position), 0) FROM Task t WHERE t.bucket.id = :bucketId")
    Integer findMaxPositionByBucketId(@Param("bucketId") Long bucketId);
    
    @Modifying
    @Query("UPDATE Task t SET t.position = t.position + 1 WHERE t.bucket.id = :bucketId AND t.position >= :position")
    void incrementPositionsFrom(@Param("bucketId") Long bucketId, @Param("position") Integer position);
    
    @Modifying
    @Query("UPDATE Task t SET t.position = t.position - 1 WHERE t.bucket.id = :bucketId AND t.position > :position")
    void decrementPositionsAfter(@Param("bucketId") Long bucketId, @Param("position") Integer position);
}
