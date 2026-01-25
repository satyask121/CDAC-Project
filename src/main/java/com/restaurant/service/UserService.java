package com.restaurant.service;

import java.util.List;

import com.restaurant.dto.UserDto;

public interface UserService {

	UserDto registerUser(UserDto userDto);

	UserDto getUserById(Long id);
	
	UserDto getUserByEmail(String email);
	
	List<UserDto> getAllUsers ();
    
}
