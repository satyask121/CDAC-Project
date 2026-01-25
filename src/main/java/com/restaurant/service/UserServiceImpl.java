package com.restaurant.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurant.dto.UserDto;
import com.restaurant.entity.User;
import com.restaurant.repository.UserRepository;

import lombok.AllArgsConstructor;

@Service
@Transactional
@AllArgsConstructor
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	
	private final ModelMapper mapper;
	
	@Override
	public UserDto registerUser(UserDto userDto) {
	User user = mapper.map(userDto, User.class);
	user.setCreatedAt(LocalDateTime.now());
	
	User saveUser = userRepository.save(user);
	return mapper.map(saveUser, UserDto.class);
		
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
	

}
