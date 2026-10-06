USE support_ticket_db;

INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES
(1, 'Sarah Agent', 'agent@support.com', '$2a$10$0nH/QGQ2SsZ.Ba1JMcEL6.LZ1eAk9nPF9FKNS4yQV7KpkFRyJnv72', 'agent', NOW()),
(2, 'Alex Support', 'alex.agent@support.com', '$2a$10$0nH/QGQ2SsZ.Ba1JMcEL6.LZ1eAk9nPF9FKNS4yQV7KpkFRyJnv72', 'agent', NOW()),
(3, 'John Customer', 'john.customer@gmail.com', '$2a$10$knHAgOIYlcaQGqqnhj68hOlo2lXLYgeD3TUk9h3Not0H8Ms6L.pr6', 'customer', NOW()),
(4, 'Alice Smith', 'alice.customer@gmail.com', '$2a$10$knHAgOIYlcaQGqqnhj68hOlo2lXLYgeD3TUk9h3Not0H8Ms6L.pr6', 'customer', NOW());

INSERT INTO tickets (id, user_id, subject, description, priority, status, assigned_to, created_at, updated_at) VALUES
(1, 3, 'Cannot access billing invoice PDF', 'When I click on Download Invoice in my dashboard, it throws a 500 server error.', 'High', 'In Progress', 1, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(2, 3, 'Feature request: Dark mode', 'Would love to have a dark mode option available in the customer portal settings.', 'Low', 'Open', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(3, 4, 'Payment charged twice on renew', 'My credit card was charged twice for the annual subscription on September 24th. Please refund the duplicate transaction.', 'Urgent', 'Open', 1, DATE_SUB(NOW(), INTERVAL 5 HOUR), NOW()),
(4, 4, 'Need help setting up 2FA', 'I lost my authenticator app backup codes and need assistance resetting 2FA for my account.', 'Medium', 'Resolved', 2, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

INSERT INTO ticket_comments (id, ticket_id, user_id, comment, created_at) VALUES
(1, 1, 3, 'Here is the invoice number: #INV-2024-8891.', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 1, 1, 'Hello John! We are looking into the invoice generation service logs right away.', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 4, 4, 'Requesting a reset link sent to my verified recovery email.', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(4, 4, 2, 'Hi Alice, we have verified your identity and sent a 2FA reset link to your registered recovery email.', DATE_SUB(NOW(), INTERVAL 1 DAY));
