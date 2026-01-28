package com.restaurant.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurant.dto.UserDto;
import com.restaurant.dto.UserRegisterDto;
import com.restaurant.entity.Role;
import com.restaurant.entity.User;
import com.restaurant.repository.UserRepository;

import lombok.AllArgsConstructor;

@Service
@Transactional
@AllArgsConstructor
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	
	private final ModelMapper mapper;
	private final PasswordEncoder passwordEncoder;
	
	 @Override
	    public UserDto registerUser(UserRegisterDto userDto) {

	        if (userRepository.existsByEmail(userDto.getEmail())) {
	            throw new RuntimeException("Email already exists");
	        }

	        User user = new User();
	        user.setName(userDto.getName());
	        user.setEmail(userDto.getEmail());

	        // BCrypt password
	        user.setPasswordHash(
	                passwordEncoder.encode(userDto.getPassword())
	        );

	        user.setRole(Role.CUSTOMER);
	        user.setCreatedAt(LocalDateTime.now());

	        User savedUser = userRepository.save(user);
	        return mapper.map(savedUser, UserDto.class);
	    }

	@Override
	public UserDto getUserById(Long id) {
		User user = userRepository.findById(id)
				.orElseThrow(()->new RuntimeException("user not found with id :" +id));
		return mapper.map(user, UserDto.class);
	}

	@Override
	public UserDto getUserByEmail(String email) {
		User user = userRepository.findByEmail(email)
				.orElseThrow(()-> new RuntimeException("User not found with email:" +email));
				
		
		return mapper.map(user , UserDto.class);
	}

	@Override
	public List<UserDto> getAllUsers() {
		
		return userRepository.findAll()
				.stream()
				.map(user-> mapper.map(user, UserDto.class))
				.collect(Collectors.toList());
	}

	  @Override
	    public UserDto registerAdmin(UserRegisterDto userDto) {

	        if (userRepository.existsByEmail(userDto.getEmail())) {
	            throw new RuntimeException("Email already exists");
	        }

	        User user = new User();
	        user.setName(userDto.getName());
	        user.setEmail(userDto.getEmail());

	        // 🔐 BCrypt password
	        user.setPasswordHash(
	                passwordEncoder.encode(userDto.getPassword())
	        );

	        user.setRole(Role.ADMIN);
	        user.setCreatedAt(LocalDateTime.now());

	        User savedUser = userRepository.save(user);
	        return mapper.map(savedUser, UserDto.class);
	    }

}
