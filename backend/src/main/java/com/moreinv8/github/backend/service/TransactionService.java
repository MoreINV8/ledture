package com.moreinv8.github.backend.service;

import com.moreinv8.github.backend.exception.BusinessException;
import com.moreinv8.github.backend.model.Transaction;
import com.moreinv8.github.backend.model.User;
import com.moreinv8.github.backend.repository.TransactionRepository;
import com.moreinv8.github.backend.repository.UserRepository;
import com.moreinv8.github.backend.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public TransactionService(TransactionRepository transactionRepository,
                              UserRepository userRepository,
                              CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    private void ensureRecentDate(LocalDate date) {
        if (date.isBefore(LocalDate.now().minusDays(7))) {
            throw new BusinessException("Transaction date cannot be more than 7 days in the past.");
        }
    }

    private User fetchUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found"));
    }

    @Transactional
    public Transaction createTransaction(UUID userId, BigDecimal amount, String type,
                                         LocalDate transactionDate, String note,
                                         UUID categoryId) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Amount must be greater than 0");
        }
        if (!"I".equals(type) && !"E".equals(type)) {
            throw new BusinessException("Type must be 'I' (Income) or 'E' (Expense)");
        }
        LocalDate date = transactionDate != null ? transactionDate : LocalDate.now();
        ensureRecentDate(date);

        User user = fetchUser(userId);

        Transaction transaction = new Transaction();
        transaction.setAmount(amount);
        transaction.setType(type);
        transaction.setTransactionDate(date);
        transaction.setNote(note);
        transaction.setUser(user);

        if (categoryId != null) {
            var category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new BusinessException("Category not found"));
            transaction.setCategory(category);
        }

        return transactionRepository.save(transaction);
    }

    public List<Transaction> getUserTransactions(UUID userId) {
        fetchUser(userId); // ensures existence
        return transactionRepository.findByUserIdOrderByTransactionDateDesc(userId);
    }

    @Transactional
    public Transaction updateTransaction(UUID userId, UUID transactionId, BigDecimal amount,
                                         String type, LocalDate transactionDate,
                                         String note, UUID categoryId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new BusinessException("Transaction not found"));
        if (!transaction.getUser().getId().equals(userId)) {
            throw new BusinessException("User does not own this transaction");
        }
        if (amount != null) {
            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException("Amount must be greater than 0");
            }
            transaction.setAmount(amount);
        }
        if (type != null) {
            if (!"I".equals(type) && !"E".equals(type)) {
                throw new BusinessException("Type must be 'I' or 'E'");
            }
            transaction.setType(type);
        }
        if (transactionDate != null) {
            ensureRecentDate(transactionDate);
            transaction.setTransactionDate(transactionDate);
        }
        if (note != null) {
            transaction.setNote(note);
        }
        if (categoryId != null) {
            var category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new BusinessException("Category not found"));
            transaction.setCategory(category);
        } else {
            transaction.setCategory(null);
        }
        return transactionRepository.save(transaction);
    }

    @Transactional
    public void deleteTransaction(UUID userId, UUID transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new BusinessException("Transaction not found"));
        if (!transaction.getUser().getId().equals(userId)) {
            throw new BusinessException("User does not own this transaction");
        }
        ensureRecentDate(transaction.getTransactionDate());
        transactionRepository.delete(transaction);
    }
}
