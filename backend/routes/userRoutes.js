const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', verifyToken, authorizeRoles('agent'), getUsers);

module.exports = router;
