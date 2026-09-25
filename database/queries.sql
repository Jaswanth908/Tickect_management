USE support_ticket_db;

SELECT 
    t.id AS ticket_id,
    t.subject,
    t.description,
    t.priority,
    t.status,
    t.created_at,
    u.name AS customer_name,
    u.email AS customer_email
FROM tickets t
INNER JOIN users u ON t.user_id = u.id
WHERE t.status = 'Open'
ORDER BY t.created_at DESC;

SELECT 
    t.id AS ticket_id,
    t.subject,
    t.description,
    t.priority,
    t.status,
    t.created_at,
    t.updated_at,
    customer.id AS customer_id,
    customer.name AS customer_name,
    customer.email AS customer_email,
    agent.id AS agent_id,
    agent.name AS assigned_agent_name,
    agent.email AS assigned_agent_email
FROM tickets t
INNER JOIN users customer ON t.user_id = customer.id
LEFT JOIN users agent ON t.assigned_to = agent.id
ORDER BY t.created_at DESC;

SELECT 
    tc.id AS comment_id,
    tc.ticket_id,
    tc.comment,
    tc.created_at,
    u.id AS user_id,
    u.name AS author_name,
    u.email AS author_email,
    u.role AS author_role
FROM ticket_comments tc
INNER JOIN users u ON tc.user_id = u.id
WHERE tc.ticket_id = 1
ORDER BY tc.created_at ASC;

SELECT 
    COUNT(*) AS total_tickets,
    SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) AS open_tickets,
    SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_tickets,
    SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved_tickets,
    SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) AS closed_tickets
FROM tickets;
