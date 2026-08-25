package com.moreinv8.github.backend.controller;

import com.moreinv8.github.backend.exception.BusinessException;
import com.moreinv8.github.backend.model.User;
import com.moreinv8.github.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    // In a real app, use BCryptPasswordEncoder or similar
    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public static class RegisterRequest {
        public String email;
        public String password;
    }

    public static class LoginRequest {
        public String email;
        public String password;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        // simple duplicate check
        Optional<User> existing = userRepository.findByEmail(req.email);
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("DUPLICATE_EMAIL");
        }
        // In a real app, hash the password
        User user = new User(req.email, req.password);
        userRepository.save(user);
        return new ResponseEntity<>("REGISTERED", HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        // Placeholder: no real session handling
        User user = userRepository.findByEmail(req.email)
                .orElseThrow(() -> new BusinessException("UNAUTHORIZED"));
        if (!user.getPasswordHash().equals(req.password)) {
            throw new BusinessException("UNAUTHORIZED");
        }
        // In a real app, create session / JWT
        return ResponseEntity.ok("LOGGED_IN");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // Placeholder: clear session logic would go here
        return ResponseEntity.ok("LOGGED_OUT");
    }
}
