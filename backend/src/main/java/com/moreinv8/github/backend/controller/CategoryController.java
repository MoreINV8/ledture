package com.moreinv8.github.backend.controller;

import com.moreinv8.github.backend.model.Category;
import com.moreinv8.github.backend.repository.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public static class CategoryResponse {
        public java.util.UUID id;
        public String label;
        public static CategoryResponse from(Category c) {
            CategoryResponse r = new CategoryResponse();
            r.id = c.getId();
            r.label = c.getLabel();
            return r;
        }
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> listCategories() {
        List<CategoryResponse> resp = categoryRepository.findAll()
                .stream()
                .map(CategoryResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(resp);
    }
}
