INSERT INTO categories (label, emoji, type)
VALUES
    ('Food & Dining', '🍔', 'E'),
    ('Transportation', '🚗', 'E'),
    ('Shopping', '🛍️', 'E'),
    ('Bills & Utilities', '💡', 'E'),
    ('Entertainment', '🎬', 'E'),
    ('Healthcare', '🩺', 'E'),
    ('Salary', '💼', 'I'),
    ('Freelance', '💻', 'I'),
    ('Investments', '📈', 'I'),
    ('Gifts & Bonus', '🎁', 'I')
ON CONFLICT(label) DO UPDATE
SET emoji = EXCLUDED.emoji,
    type = EXCLUDED.type;
