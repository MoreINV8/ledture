package com.moreinv8.github.backend.controller;

import com.moreinv8.github.backend.exception.BusinessException;
import com.moreinv8.github.backend.model.User;
import com.moreinv8.github.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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
        if (req.email == null || req.email.isBlank() || req.password == null || req.password.length() < 8) {
            throw new BusinessException("INVALID_CREDENTIALS");
        }
        String email = req.email.trim().toLowerCase();
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("DUPLICATE_EMAIL");
        }
        User user = new User(email, passwordEncoder.encode(req.password));
        userRepository.save(user);
        return new ResponseEntity<>("REGISTERED", HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletRequest request) {
        if (req.email == null || req.password == null) {
            throw new BusinessException("UNAUTHORIZED");
        }
        User user = userRepository.findByEmail(req.email.trim().toLowerCase())
                .orElseThrow(() -> new BusinessException("UNAUTHORIZED"));

        String storedPassword = user.getPasswordHash();
        boolean legacyPlainTextPassword = !storedPassword.startsWith("$2");
        boolean passwordMatches = legacyPlainTextPassword
                ? storedPassword.equals(req.password)
                : passwordEncoder.matches(req.password, storedPassword);
        if (!passwordMatches) {
            throw new BusinessException("UNAUTHORIZED");
        }

        // Transparently upgrade accounts created by the old placeholder implementation.
        if (legacyPlainTextPassword) {
            user.setPasswordHash(passwordEncoder.encode(req.password));
            userRepository.save(user);
        }

        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) oldSession.invalidate();

        var authentication = UsernamePasswordAuthenticationToken.authenticated(
                user.getEmail(), null, AuthorityUtils.NO_AUTHORITIES);
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        request.getSession(true).setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                context);
        return ResponseEntity.ok("LOGGED_IN");
    }

    @GetMapping("/session")
    public ResponseEntity<?> session() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(new SessionResponse(authentication.getName()));
    }

    public record SessionResponse(String email) {}

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("LOGGED_OUT");
    }
}
