package com.restaurant.controller;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.restaurant.dto.ErrorResponse;
import com.restaurant.dto.LoginRequestDto;
import com.restaurant.dto.LoginResponseDto;
import com.restaurant.dto.UserDto;
import com.restaurant.dto.UserRegisterDto;
import com.restaurant.entity.User;
import com.restaurant.repository.UserRepository;
import com.restaurant.security.JwtUtils;
import com.restaurant.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * AuthController
 * --------------
 * Handles user authentication (LOGIN)
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final UserService userService;
    /**
     * Login API
     */
    @PostMapping("/login")
    public LoginResponseDto authenticateUser(
            @Valid @RequestBody LoginRequestDto dto) {

        log.info(" Login request for email : {}", dto.getEmail());

        // 1. Authenticate user credentials
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        dto.getEmail(), dto.getPassword())
        );
        

        // 2. Fetch user details
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow();

        // 3. Generate JWT
        String token = jwtUtils.generateToken(
                user.getEmail(),
                user.getId(),
                user.getRole().name()
        );

        log.info("Login successful for user : {}", dto.getEmail());

        return new LoginResponseDto(token);
    }
    
    @PostMapping("/register-customer")
    public ResponseEntity<?> registerCustomer(
            @Valid @RequestBody UserRegisterDto userDto) {

        UserDto savedUser = userService.registerUser(userDto);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
}
    @PostMapping("/register-staff")
    public ResponseEntity<?> registerStaff(
            @Valid @RequestBody UserRegisterDto userDto) {

        UserDto savedUser = userService.registerStaff(userDto);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }
    
    /**
     * Get current authenticated user
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getPrincipal().equals("anonymousUser")) {
            ErrorResponse error = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.UNAUTHORIZED.value(),
                "Unauthorized",
                "Not authenticated",
                request.getRequestURI()
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        String email = authentication.getName();
        UserDto user = userService.getUserByEmail(email);
        
        return ResponseEntity.ok(user);
    }
}