const { pool } = require('../config/db');

const getComments = async (req, res, next) => {
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

    if (req.user.role === 'customer' && ticket.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view comments for this ticket.'
      });
    }

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

    if (req.user.role === 'customer' && ticket.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to comment on this ticket.'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES (?, ?, ?)',
      [ticketId, req.user.id, comment.trim()]
    );

    const commentId = result.insertId;

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
