package com.example.demo.repository;

import com.example.demo.entity.ChatGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatGroupRepository extends JpaRepository<ChatGroup, Long> {
    List<ChatGroup> findByMembersUsername(String username);
}
