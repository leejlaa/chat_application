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
        userService.sendFriendRequest(senderUsername, receiverUsername);
        return ResponseEntity.ok("Friend request sent.");
    }

    @PutMapping("/accept")
    public ResponseEntity<?> acceptFriendRequest(@RequestParam String receiverUsername, @RequestParam String senderUsername) {
        userService.acceptFriendRequest(receiverUsername, senderUsername);
        return ResponseEntity.ok("Friend request accepted.");
    }

    @PutMapping("/reject")
    public ResponseEntity<?> rejectFriendRequest(@RequestParam String receiverUsername, @RequestParam String senderUsername) {
        userService.rejectFriendRequest(receiverUsername, senderUsername);
        return ResponseEntity.ok("Friend request rejected.");
    }

    @DeleteMapping("/remove")
    public ResponseEntity<?> removeFriend(@RequestParam String username, @RequestParam String friendUsername) {
        userService.removeFriend(username, friendUsername);
        return ResponseEntity.ok("Friend removed.");
    }

    @GetMapping("/list")
    public ResponseEntity<?> listFriends(@RequestParam String username) {
        return ResponseEntity.ok(userService.findAllFriends(username));
    }
}
