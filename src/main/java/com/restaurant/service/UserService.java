package com.restaurant.service;

import java.util.List;

import com.restaurant.dto.UserDto;
import com.restaurant.dto.UserRegisterDto;

public interface UserService {

	UserDto registerUser(UserRegisterDto userDto);

	UserDto getUserById(Long id);
	
	UserDto getUserByEmail(String email);
	
	List<UserDto> getAllUsers ();
	
	 UserDto registerAdmin(UserRegisterDto userDto);
    
}
