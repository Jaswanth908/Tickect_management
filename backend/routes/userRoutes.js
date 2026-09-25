const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Get users/agents list (Agent role only)
router.get('/', verifyToken, authorizeRoles('agent'), getUsers);

module.exports = router;
