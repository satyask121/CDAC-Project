package com.restaurant.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * DTO returned after successful login
 */
@Getter
@AllArgsConstructor
public class LoginResponseDto {
    private String token;
}
