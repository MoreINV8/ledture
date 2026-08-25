package com.moreinv8.github.backend.repository;

import com.moreinv8.github.backend.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;
import java.time.LocalDate;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    List<Transaction> findByUserId(UUID userId);
    List<Transaction> findByUserIdAndTransactionDate(UUID userId, LocalDate date);
    List<Transaction> findByUserIdOrderByTransactionDateDesc(UUID userId);
}
