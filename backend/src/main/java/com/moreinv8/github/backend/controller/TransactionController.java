package com.moreinv8.github.backend.controller;

import com.moreinv8.github.backend.exception.BusinessException;
import com.moreinv8.github.backend.model.Transaction;
import com.moreinv8.github.backend.service.TransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.moreinv8.github.backend.repository.UserRepository;
import com.moreinv8.github.backend.util.SecurityUtil;
import com.moreinv8.github.backend.util.DtoUtil;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final UserRepository userRepository;

    public TransactionController(TransactionService transactionService, UserRepository userRepository) {
        this.transactionService = transactionService;
        this.userRepository = userRepository;
    }

    // ---- DTOs ----
    public static class TransactionRequest {
        public BigDecimal amount;
        public String type; // I or E
        public LocalDate transactionDate;
        public String note;
        public UUID categoryId;
    }

    public static class TransactionResponse {
        public UUID id;
        public BigDecimal amount;
        public String type;
        public LocalDate transactionDate;
        public String note;
        public UUID userId;
        public UUID categoryId;

        public static TransactionResponse from(Transaction tx) {
            TransactionResponse r = new TransactionResponse();
            r.id = tx.getId();
            r.amount = tx.getAmount();
            r.type = tx.getType();
            r.transactionDate = tx.getTransactionDate();
            r.note = tx.getNote();
            r.userId = tx.getUser().getId();
            r.categoryId = tx.getCategory() != null ? tx.getCategory().getId() : null;
            return r;
        }
    }

    // ---- Helpers ----
    // Authentication handled via SecurityUtil
    @PostMapping
    public ResponseEntity<?> createTransaction(@RequestBody TransactionRequest request) {
        UUID userId = SecurityUtil.getAuthenticatedUserId(userRepository);
        Transaction tx = transactionService.createTransaction(
                userId,
                request.amount,
                request.type,
                request.transactionDate,
                request.note,
                request.categoryId);
        return new ResponseEntity<>(DtoUtil.toResponse(tx), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(@PathVariable("id") UUID id,
                                               @RequestBody TransactionRequest request) {
        UUID userId = SecurityUtil.getAuthenticatedUserId(userRepository);
        Transaction tx = transactionService.updateTransaction(
                userId,
                id,
                request.amount,
                request.type,
                request.transactionDate,
                request.note,
                request.categoryId);
        return ResponseEntity.ok(DtoUtil.toResponse(tx));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable("id") UUID id) {
        UUID userId = SecurityUtil.getAuthenticatedUserId(userRepository);
        transactionService.deleteTransaction(userId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<?> listTransactions(@RequestParam(required = false) Integer year,
                                              @RequestParam(required = false) Integer month,
                                              @RequestParam(required = false) Integer date) {
        UUID userId = SecurityUtil.getAuthenticatedUserId(userRepository);
        List<Transaction> all = transactionService.getUserTransactions(userId);
        // simple filtering based on optional query params
        List<Transaction> filtered = all.stream().filter(tx -> {
            if (year != null && tx.getTransactionDate().getYear() != year) return false;
            if (month != null && tx.getTransactionDate().getMonthValue() != month) return false;
            if (date != null && tx.getTransactionDate().getDayOfMonth() != date) return false;
            return true;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(filtered.stream().map(DtoUtil::toResponse).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTransaction(@PathVariable("id") UUID id) {
        UUID userId = SecurityUtil.getAuthenticatedUserId(userRepository);
        Transaction tx = transactionService.getUserTransactions(userId).stream()
                .filter(t -> t.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new BusinessException("Transaction not found"));
        return ResponseEntity.ok(DtoUtil.toResponse(tx));
    }
}
