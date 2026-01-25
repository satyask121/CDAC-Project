package com.restaurant.service;

import java.util.List;

import com.restaurant.dto.FoodCategoryDto;

public interface FoodCategoryService {

    FoodCategoryDto createCategory(FoodCategoryDto categoryDto);

    FoodCategoryDto getCategoryById(Long id);

    List<FoodCategoryDto> getAllCategories();

    FoodCategoryDto updateCategory(Long id, FoodCategoryDto categoryDto);

    void deleteCategory(Long id);
}
