package com.restaurant.service;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurant.dto.FoodItemDto;
import com.restaurant.entity.FoodCategory;
import com.restaurant.entity.FoodItem;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.FoodCategoryRepository;
import com.restaurant.repository.FoodItemRepository;

import lombok.AllArgsConstructor;

@Service
@Transactional
@AllArgsConstructor
public class FoodItemServiceImpl implements FoodItemService {


    private final FoodItemRepository foodItemRepository;
    private final FoodCategoryRepository categoryRepository;
    private final ModelMapper modelMapper;
	 @Override
	    public FoodItemDto addFoodItem(FoodItemDto dto) {

	        FoodCategory category = categoryRepository.findById(dto.getCategoryId())
	                .orElseThrow(() ->
	                        new ResourceNotFoundException("Category not found with id : " + dto.getCategoryId()));

	        FoodItem foodItem = modelMapper.map(dto, FoodItem.class);
	        foodItem.setCategory(category);

	        if (foodItem.getIsAvailable() == null) {
	            foodItem.setIsAvailable(true);
	        }

	        FoodItem saved = foodItemRepository.save(foodItem);
	        FoodItemDto response = modelMapper.map(saved, FoodItemDto.class);
	        response.setCategoryId(category.getId());

	        return response;
	    }

	    @Override
	    public FoodItemDto getFoodItemById(Long id) {
	        FoodItem foodItem = foodItemRepository.findById(id)
	                .orElseThrow(() ->
	                        new ResourceNotFoundException("Food item not found with id : " + id));

	        FoodItemDto dto = modelMapper.map(foodItem, FoodItemDto.class);
	        dto.setCategoryId(foodItem.getCategory().getId());
	        return dto;
	    }

	    @Override
	    public List<FoodItemDto> getAllFoodItems() {
	        return foodItemRepository.findAll()
	                .stream()
	                .map(item -> {
	                    FoodItemDto dto = modelMapper.map(item, FoodItemDto.class);
	                    dto.setCategoryId(item.getCategory().getId());
	                    return dto;
	                })
	                .collect(Collectors.toList());
	    }

	    @Override
	    public List<FoodItemDto> getFoodItemsByCategory(Long categoryId) {
	        return foodItemRepository.findByCategoryId(categoryId)
	                .stream()
	                .map(item -> {
	                    FoodItemDto dto = modelMapper.map(item, FoodItemDto.class);
	                    dto.setCategoryId(item.getCategory().getId());
	                    return dto;
	                })
	                .collect(Collectors.toList());
	    }

	    @Override
	    public List<FoodItemDto> getVegFoodItems() {
	        return foodItemRepository.findByIsVeg(true)
	                .stream()
	                .map(item -> {
	                    FoodItemDto dto = modelMapper.map(item, FoodItemDto.class);
	                    dto.setCategoryId(item.getCategory().getId());
	                    return dto;
	                })
	                .collect(Collectors.toList());
	    }

	    @Override
	    public FoodItemDto updateFoodItem(Long id, FoodItemDto dto) {

	        FoodItem existing = foodItemRepository.findById(id)
	                .orElseThrow(() ->
	                        new ResourceNotFoundException("Food item not found with id : " + id));

	        modelMapper.map(dto, existing);

	        if (dto.getCategoryId() != null) {
	            FoodCategory category = categoryRepository.findById(dto.getCategoryId())
	                    .orElseThrow(() ->
	                            new ResourceNotFoundException("Category not found with id : " + dto.getCategoryId()));
	            existing.setCategory(category);
	        }

	        FoodItem updated = foodItemRepository.save(existing);
	        FoodItemDto response = modelMapper.map(updated, FoodItemDto.class);
	        response.setCategoryId(updated.getCategory().getId());

	        return response;
	    }

	    @Override
	    public void deleteFoodItem(Long id) {
	        FoodItem foodItem = foodItemRepository.findById(id)
	                .orElseThrow(() ->
	                        new ResourceNotFoundException("Food item not found with id : " + id));

	        foodItemRepository.delete(foodItem);
	    }

}
