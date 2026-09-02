CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- ensure uuid generation support

-- Users table

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);


-- Categories table

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(20) NOT NULL UNIQUE,
    emoji VARCHAR(32) NOT NULL DEFAULT '🏷️'
);


-- Transactions table

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    type CHAR(1) NOT NULL CHECK (type IN ('I', 'E')),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    note VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id UUID NOT NULL,
    category_id UUID,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id)
);


-- Index for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date);
