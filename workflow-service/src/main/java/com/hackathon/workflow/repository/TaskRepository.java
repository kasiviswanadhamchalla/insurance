package com.hackathon.workflow.repository;

import com.hackathon.workflow.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    Page<Task> findByAssignedRoleAndStatus(String assignedRole, String status, Pageable pageable);
}
