INSERT INTO categories (label, emoji)
VALUES
    ('Food & Dining', '🍔'),
    ('Transportation', '🚗'),
    ('Shopping', '🛍️'),
    ('Bills & Utilities', '💡'),
    ('Entertainment', '🎬'),
    ('Healthcare', '🩺'),
    ('Salary', '💼'),
    ('Freelance', '💻'),
    ('Investments', '📈'),
    ('Gifts & Bonus', '🎁')
ON CONFLICT(label) DO NOTHING;