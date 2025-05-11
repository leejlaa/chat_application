package com.example.demo.service;

import com.example.demo.dto.CreateGroupRequest;
import com.example.demo.entity.ChatGroup;
import com.example.demo.entity.User;
import com.example.demo.repository.ChatGroupRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class GroupService {

    @Autowired
    private ChatGroupRepository chatGroupRepository;

    @Autowired
    private UserRepository userRepository;

    public ChatGroup createGroup(String creatorUsername, CreateGroupRequest request) {
        ChatGroup group = new ChatGroup();
        group.setName(request.getName());

        Set<User> members = new HashSet<>();
        request.getMemberUsernames().forEach(username -> {
            userRepository.findByUsername(username).ifPresent(members::add);
        });

        User creator = userRepository.findByUsername(creatorUsername)
                .orElseThrow(() -> new RuntimeException("Creator not found"));

        members.add(creator);
        group.setMembers(members);

        return chatGroupRepository.save(group);
    }

    public List<ChatGroup> getGroupsForUser(String username) {
        return chatGroupRepository.findByMembersUsername(username);
    }
}
