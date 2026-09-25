const { pool } = require('../config/db');

const ALLOWED_STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];
const ALLOWED_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

/**
 * GET /api/tickets
 * Get tickets list.
 * - Customer: Only their own tickets.
 * - Agent: All tickets with optional search, filter, and sort.
 */
const getTickets = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    const { status, priority, search, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

    const conditions = [];
    const params = [];

    // Role-based visibility
    if (role === 'customer') {
      conditions.push('t.user_id = ?');
      params.push(userId);
    }

    // Filter by status
    if (status && ALLOWED_STATUSES.includes(status)) {
      conditions.push('t.status = ?');
      params.push(status);
    }

    // Filter by priority
    if (priority && ALLOWED_PRIORITIES.includes(priority)) {
      conditions.push('t.priority = ?');
      params.push(priority);
    }

    // Search keyword in subject or description or customer name
    if (search && search.trim() !== '') {
      conditions.push('(t.subject LIKE ? OR t.description LIKE ? OR u.name LIKE ?)');
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Safe sorting columns
    const allowedSortFields = ['created_at', 'updated_at', 'priority', 'status', 'id'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? `t.${sortBy}` : 't.created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const query = `
      SELECT 
        t.id,
        t.user_id,
        t.subject,
        t.description,
        t.priority,
        t.status,
        t.assigned_to,
        t.created_at,
        t.updated_at,
        u.name AS customer_name,
        u.email AS customer_email,
        agent.name AS assigned_agent_name,
        agent.email AS assigned_agent_email
      FROM tickets t
      INNER JOIN users u ON t.user_id = u.id
      LEFT JOIN users agent ON t.assigned_to = agent.id
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
    `;

    const [tickets] = await pool.execute(query, params);

    return res.status(200).json({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/tickets
 * Create a new ticket (Customer capability)
 */
const createTicket = async (req, res, next) => {
  try {
    const { subject, description, priority = 'Medium' } = req.body;
    const userId = req.user.id;

    // Validation
    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Ticket subject is required.'
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Ticket description is required.'
      });
    }

    const selectedPriority = ALLOWED_PRIORITIES.includes(priority) ? priority : 'Medium';

    const [result] = await pool.execute(
      `INSERT INTO tickets (user_id, subject, description, priority, status) 
       VALUES (?, ?, ?, ?, 'Open')`,
      [userId, subject.trim(), description.trim(), selectedPriority]
    );

    const ticketId = result.insertId;

    // Fetch newly created ticket with author details
    const [createdRows] = await pool.execute(
      `SELECT 
        t.id,
        t.user_id,
        t.subject,
        t.description,
        t.priority,
        t.status,
        t.assigned_to,
        t.created_at,
        t.updated_at,
        u.name AS customer_name,
        u.email AS customer_email
      FROM tickets t
      INNER JOIN users u ON t.user_id = u.id
      WHERE t.id = ?`,
      [ticketId]
    );

    return res.status(201).json({
      success: true,
      message: 'Ticket created successfully.',
      ticket: createdRows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tickets/:id
 * Get details of a specific ticket.
 * - Customer: Only permitted if they own the ticket.
 * - Agent: Permitted for any ticket.
 */
const getTicketById = async (req, res, next) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID provided.'
      });
    }

    const [tickets] = await pool.execute(
      `SELECT 
        t.id,
        t.user_id,
        t.subject,
        t.description,
        t.priority,
        t.status,
        t.assigned_to,
        t.created_at,
        t.updated_at,
        u.name AS customer_name,
        u.email AS customer_email,
        agent.name AS assigned_agent_name,
        agent.email AS assigned_agent_email
      FROM tickets t
      INNER JOIN users u ON t.user_id = u.id
      LEFT JOIN users agent ON t.assigned_to = agent.id
      WHERE t.id = ? LIMIT 1`,
      [ticketId]
    );

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Ticket with ID ${ticketId} not found.`
      });
    }

    const ticket = tickets[0];

    // Authorization check: Customer can only view their own ticket
    if (req.user.role === 'customer' && ticket.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this ticket.'
      });
    }

    return res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/tickets/:id
 * Update ticket details (status, priority, assigned_to).
 * - Agent: Can update status, priority, assigned_to.
 * - Customer: Can only update subject/description if ticket is Open (or forbidden from changing status/assignee).
 */
const updateTicket = async (req, res, next) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID.'
      });
    }

    // Check if ticket exists
    const [existing] = await pool.execute(
      'SELECT id, user_id, status FROM tickets WHERE id = ? LIMIT 1',
      [ticketId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Ticket with ID ${ticketId} not found.`
      });
    }

    const currentTicket = existing[0];
    const { status, priority, assigned_to, subject, description } = req.body;

    // Role-based logic
    if (req.user.role === 'customer') {
      // Customer cannot update other customer's tickets
      if (currentTicket.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You cannot modify this ticket.'
        });
      }

      // Customer cannot change status or assign agent
      if (status !== undefined || assigned_to !== undefined) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Customers cannot alter ticket status or agent assignment.'
        });
      }

      // Customer updates subject / description
      const updates = [];
      const values = [];

      if (subject && subject.trim()) {
        updates.push('subject = ?');
        values.push(subject.trim());
      }
      if (description && description.trim()) {
        updates.push('description = ?');
        values.push(description.trim());
      }
      if (priority && ALLOWED_PRIORITIES.includes(priority)) {
        updates.push('priority = ?');
        values.push(priority);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields provided for update.'
        });
      }

      values.push(ticketId);
      await pool.execute(
        `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    } else if (req.user.role === 'agent') {
      // Agent updates status, priority, assigned_to
      const updates = [];
      const values = [];

      if (status !== undefined) {
        if (!ALLOWED_STATUSES.includes(status)) {
          return res.status(400).json({
            success: false,
            message: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`
          });
        }
        updates.push('status = ?');
        values.push(status);
      }

      if (priority !== undefined) {
        if (!ALLOWED_PRIORITIES.includes(priority)) {
          return res.status(400).json({
            success: false,
            message: `Invalid priority. Allowed values: ${ALLOWED_PRIORITIES.join(', ')}`
          });
        }
        updates.push('priority = ?');
        values.push(priority);
      }

      if (assigned_to !== undefined) {
        if (assigned_to === null || assigned_to === '' || assigned_to === 0) {
          updates.push('assigned_to = NULL');
        } else {
          // Verify assigned_to user is an agent
          const [agentCheck] = await pool.execute(
            'SELECT id FROM users WHERE id = ? AND role = "agent" LIMIT 1',
            [assigned_to]
          );
          if (agentCheck.length === 0) {
            return res.status(400).json({
              success: false,
              message: 'Invalid agent ID specified for assignment.'
            });
          }
          updates.push('assigned_to = ?');
          values.push(assigned_to);
        }
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields provided for update.'
        });
      }

      values.push(ticketId);
      await pool.execute(
        `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    // Fetch and return updated ticket
    const [updatedRows] = await pool.execute(
      `SELECT 
        t.id,
        t.user_id,
        t.subject,
        t.description,
        t.priority,
        t.status,
        t.assigned_to,
        t.created_at,
        t.updated_at,
        u.name AS customer_name,
        u.email AS customer_email,
        agent.name AS assigned_agent_name,
        agent.email AS assigned_agent_email
      FROM tickets t
      INNER JOIN users u ON t.user_id = u.id
      LEFT JOIN users agent ON t.assigned_to = agent.id
      WHERE t.id = ?`,
      [ticketId]
    );

    return res.status(200).json({
      success: true,
      message: 'Ticket updated successfully.',
      ticket: updatedRows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/tickets/:id
 * Delete a ticket
 */
const deleteTicket = async (req, res, next) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID.'
      });
    }

    const [tickets] = await pool.execute(
      'SELECT id, user_id FROM tickets WHERE id = ? LIMIT 1',
      [ticketId]
    );

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Ticket with ID ${ticketId} not found.`
      });
    }

    const ticket = tickets[0];

    // Customer can only delete their own ticket
    if (req.user.role === 'customer' && ticket.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot delete another customer\'s ticket.'
      });
    }

    await pool.execute('DELETE FROM tickets WHERE id = ?', [ticketId]);

    return res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tickets/stats
 * Get ticket statistics for agent dashboard
 */
const getTicketStats = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) AS total_tickets,
        COALESCE(SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END), 0) AS open_tickets,
        COALESCE(SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END), 0) AS in_progress_tickets,
        COALESCE(SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END), 0) AS resolved_tickets,
        COALESCE(SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END), 0) AS closed_tickets,
        COALESCE(SUM(CASE WHEN priority = 'Urgent' THEN 1 ELSE 0 END), 0) AS urgent_tickets,
        COALESCE(SUM(CASE WHEN priority = 'High' THEN 1 ELSE 0 END), 0) AS high_tickets
      FROM tickets
    `);

    return res.status(200).json({
      success: true,
      stats: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTickets,
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket,
  getTicketStats
};
