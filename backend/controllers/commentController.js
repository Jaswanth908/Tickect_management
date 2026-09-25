const { pool } = require('../config/db');

/**
 * GET /api/tickets/:id/comments
 * Get all comments/responses for a specific ticket
 */
const getComments = async (req, res, next) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID.'
      });
    }

    // Check if ticket exists and user has permission to access it
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

    // Customer can only view comments on their own ticket
    if (req.user.role === 'customer' && ticket.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view comments for this ticket.'
      });
    }

    // Retrieve comments joined with user details
    const [comments] = await pool.execute(
      `SELECT 
        c.id,
        c.ticket_id,
        c.user_id,
        c.comment,
        c.created_at,
        u.name AS user_name,
        u.email AS user_email,
        u.role AS user_role
      FROM ticket_comments c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.ticket_id = ?
      ORDER BY c.created_at ASC`,
      [ticketId]
    );

    return res.status(200).json({
      success: true,
      count: comments.length,
      comments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/tickets/:id/comments
 * Add a comment or response to a ticket
 */
const addComment = async (req, res, next) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID.'
      });
    }

    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text cannot be empty.'
      });
    }

    // Verify ticket exists
    const [tickets] = await pool.execute(
      'SELECT id, user_id, status FROM tickets WHERE id = ? LIMIT 1',
      [ticketId]
    );

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Ticket with ID ${ticketId} not found.`
      });
    }

    const ticket = tickets[0];

    // Customer cannot comment on another customer's ticket
    if (req.user.role === 'customer' && ticket.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to comment on this ticket.'
      });
    }

    // Insert comment
    const [result] = await pool.execute(
      'INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES (?, ?, ?)',
      [ticketId, req.user.id, comment.trim()]
    );

    const commentId = result.insertId;

    // Fetch created comment with author info
    const [createdCommentRows] = await pool.execute(
      `SELECT 
        c.id,
        c.ticket_id,
        c.user_id,
        c.comment,
        c.created_at,
        u.name AS user_name,
        u.email AS user_email,
        u.role AS user_role
      FROM ticket_comments c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [commentId]
    );

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      comment: createdCommentRows[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComments,
  addComment
};
