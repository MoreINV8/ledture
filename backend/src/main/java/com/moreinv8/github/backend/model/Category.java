package com.moreinv8.github.backend.model;

import jakarta.persistence.*;
import java.util.*;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "UUID", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "label", length = 20, nullable = false, unique = true)
    private String label;

    @Column(name = "emoji", length = 32, nullable = false)
    private String emoji;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Transaction> transactions = new ArrayList<>();

    public Category() {}

    public Category(String label) {
        this.label = label;
        this.emoji = "🏷️";
    }

    public Category(String label, String emoji) {
        this.label = label;
        this.emoji = emoji;
    }

    // getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }
    public List<Transaction> getTransactions() { return transactions; }
    public void setTransactions(List<Transaction> transactions) { this.transactions = transactions; }
}
