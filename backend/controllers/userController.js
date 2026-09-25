const { pool } = require('../config/db');

/**
 * GET /api/users
 * Retrieve users or agents list (Agent access only)
 */
const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;

    let query = 'SELECT id, name, email, role, created_at FROM users';
    const params = [];

    if (role && ['customer', 'agent'].includes(role)) {
      query += ' WHERE role = ?';
      params.push(role);
    }

    query += ' ORDER BY name ASC';

    const [users] = await pool.execute(query, params);

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers
};
