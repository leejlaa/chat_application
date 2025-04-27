package com.example.demo.controller;

import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    @Autowired
    private UserService userService;

    @PostMapping("/request")
    public ResponseEntity<?> sendFriendRequest(@RequestParam String senderUsername, @RequestParam String receiverUsername) {
        try {
            userService.sendFriendRequest(senderUsername, receiverUsername);
            return ResponseEntity.ok("Friend request sent.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/accept")
    public ResponseEntity<?> acceptFriendRequest(@RequestParam String receiverUsername, @RequestParam String senderUsername) {
        try {
            userService.acceptFriendRequest(receiverUsername, senderUsername);
            return ResponseEntity.ok("Friend request accepted.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/reject")
    public ResponseEntity<?> rejectFriendRequest(@RequestParam String receiverUsername, @RequestParam String senderUsername) {
        try {
            userService.rejectFriendRequest(receiverUsername, senderUsername);
            return ResponseEntity.ok("Friend request rejected.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/remove")
    public ResponseEntity<?> removeFriend(@RequestParam String username, @RequestParam String friendUsername) {
        try {
            userService.removeFriend(username, friendUsername);
            return ResponseEntity.ok("Friend removed.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/list")
    public ResponseEntity<?> listFriends(@RequestParam String username) {
        try {
            return ResponseEntity.ok(userService.findAllFriends(username));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingFriendRequests(@RequestParam String username) {
        try {
            return ResponseEntity.ok(userService.getPendingFriendRequests(username));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
