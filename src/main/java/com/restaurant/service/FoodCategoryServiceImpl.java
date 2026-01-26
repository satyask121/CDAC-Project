package com.restaurant.service;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurant.dto.FoodCategoryDto;
import com.restaurant.entity.FoodCategory;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.FoodCategoryRepository;

@Service
@Transactional
public class FoodCategoryServiceImpl implements FoodCategoryService {

    private final FoodCategoryRepository categoryRepository;
    private final ModelMapper modelMapper;

    public FoodCategoryServiceImpl(
            FoodCategoryRepository categoryRepository,
            ModelMapper modelMapper) {
        this.categoryRepository = categoryRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public FoodCategoryDto createCategory(FoodCategoryDto categoryDto) {
        FoodCategory category = modelMapper.map(categoryDto, FoodCategory.class);

        // default active
        if (category.getIsActive() == null) {
            category.setIsActive(true);
        }

        FoodCategory savedCategory = categoryRepository.save(category);
        return modelMapper.map(savedCategory, FoodCategoryDto.class);
    }

    @Override
    public FoodCategoryDto getCategoryById(Long id) {
        FoodCategory category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Food category not found with id : " + id));

        return modelMapper.map(category, FoodCategoryDto.class);
    }

    @Override
    public List<FoodCategoryDto> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(category -> modelMapper.map(category, FoodCategoryDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public FoodCategoryDto updateCategory(Long id, FoodCategoryDto categoryDto) {
        FoodCategory existingCategory = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Food category not found with id : " + id));

        // ModelMapper will update only non-null fields (your config)
        modelMapper.map(categoryDto, existingCategory);

        FoodCategory updatedCategory = categoryRepository.save(existingCategory);
        return modelMapper.map(updatedCategory, FoodCategoryDto.class);
    }

    @Override
    public void deleteCategory(Long id) {
        FoodCategory category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Food category not found with id : " + id));

        category.setIsActive(false);   // soft delete
        categoryRepository.save(category);

    }
}
