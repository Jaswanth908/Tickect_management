const express = require('express');
const router = express.Router();
const {
  getTickets,
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket,
  getTicketStats
} = require('../controllers/ticketController');
const {
  getComments,
  addComment
} = require('../controllers/commentController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.get('/stats', authorizeRoles('agent'), getTicketStats);

router.get('/', getTickets);
router.post('/', createTicket);
router.get('/:id', getTicketById);
router.put('/:id', updateTicket);
router.delete('/:id', deleteTicket);

router.get('/:id/comments', getComments);
router.post('/:id/comments', addComment);

module.exports = router;
