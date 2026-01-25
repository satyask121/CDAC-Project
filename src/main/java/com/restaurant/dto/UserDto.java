package com.restaurant.dto;

import com.restaurant.entity.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDto {

	private Long id;

	@NotBlank
	private String name;
	
	@NotBlank
	@Email
	private String email;
	
	@NotBlank
	 @Pattern(
		        regexp = "^[0-9]{10}$",
		        message = "Phone number must be 10 digits"
		    )
	private String phone;
	
	private Role role;
}
