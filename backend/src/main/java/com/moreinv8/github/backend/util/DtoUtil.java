package com.moreinv8.github.backend.util;

import com.moreinv8.github.backend.model.Transaction;
import com.moreinv8.github.backend.controller.TransactionController.TransactionResponse;

/**
 * Simple static mapper for converting JPA entities to the DTO objects exposed by the REST API.
 * Keeping this logic in one place makes it trivial to replace with MapStruct or another mapper later.
 */
public final class DtoUtil {
    private DtoUtil() {}

    public static TransactionResponse toResponse(Transaction tx) {
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
