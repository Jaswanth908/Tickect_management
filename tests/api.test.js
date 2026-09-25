const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock database pool before requiring app
jest.mock('../backend/config/db', () => ({
  pool: {
    execute: jest.fn()
  },
  testConnection: jest.fn().mockResolvedValue(true)
}));

const { pool } = require('../backend/config/db');
const app = require('../backend/app');

describe('Support Ticket Management System - Automated API Tests', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_support_tickets_2024';

  const mockCustomer = {
    id: 1,
    name: 'John Customer',
    email: 'john@example.com',
    role: 'customer'
  };

  const mockOtherCustomer = {
    id: 2,
    name: 'Alice Customer',
    email: 'alice@example.com',
    role: 'customer'
  };

  const mockAgent = {
    id: 99,
    name: 'Agent Smith',
    email: 'agent@support.com',
    role: 'agent'
  };

  const customerToken = jwt.sign(mockCustomer, JWT_SECRET, { expiresIn: '1h' });
  const otherCustomerToken = jwt.sign(mockOtherCustomer, JWT_SECRET, { expiresIn: '1h' });
  const agentToken = jwt.sign(mockAgent, JWT_SECRET, { expiresIn: '1h' });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  // -------------------------------------------------------------
  // 1. Authentication Tests
  // -------------------------------------------------------------
  describe('Authentication Tests (/api/auth)', () => {
    test('1. Valid registration succeeds (201)', async () => {
      pool.execute
        .mockResolvedValueOnce([[]]) // no existing user
        .mockResolvedValueOnce([{ insertId: 5 }]); // insert result

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Bob New',
          email: 'bob@example.com',
          password: 'Password123!',
          role: 'customer'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('bob@example.com');
    });

    test('2. Registration fails on missing fields (400)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'incomplete@example.com'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('3. Valid login succeeds and returns JWT token (200)', async () => {
      const passwordHash = await bcrypt.hash('CorrectPass123!', 10);
      pool.execute.mockResolvedValueOnce([[
        {
          id: 1,
          name: 'John Customer',
          email: 'john@example.com',
          password_hash: passwordHash,
          role: 'customer',
          created_at: new Date()
        }
      ]]);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'CorrectPass123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.role).toBe('customer');
    });

    test('4. Invalid password is rejected (401)', async () => {
      const passwordHash = await bcrypt.hash('CorrectPass123!', 10);
      pool.execute.mockResolvedValueOnce([[
        {
          id: 1,
          name: 'John Customer',
          email: 'john@example.com',
          password_hash: passwordHash,
          role: 'customer'
        }
      ]]);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'WrongPassword!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid/i);
    });
  });

  // -------------------------------------------------------------
  // 2. Ticket Management Tests
  // -------------------------------------------------------------
  describe('Ticket Management Tests (/api/tickets)', () => {
    test('5. Unauthorized user cannot access protected data (401)', async () => {
      const res = await request(app).get('/api/tickets');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('6. Ticket creation succeeds for authenticated customer (201)', async () => {
      pool.execute
        .mockResolvedValueOnce([{ insertId: 10 }]) // insert ticket
        .mockResolvedValueOnce([[
          {
            id: 10,
            user_id: mockCustomer.id,
            subject: 'Printer issue',
            description: 'Printer cannot connect to network',
            priority: 'High',
            status: 'Open',
            assigned_to: null,
            created_at: new Date(),
            customer_name: mockCustomer.name,
            customer_email: mockCustomer.email
          }
        ]]); // select inserted ticket

      const res = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          subject: 'Printer issue',
          description: 'Printer cannot connect to network',
          priority: 'High'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.ticket.subject).toBe('Printer issue');
    });

    test('7. Customer cannot access another customer\'s ticket (403)', async () => {
      // Ticket belongs to customer 1
      pool.execute.mockResolvedValueOnce([[
        {
          id: 10,
          user_id: 1,
          subject: 'Private ticket',
          description: 'Confidential',
          priority: 'Medium',
          status: 'Open',
          customer_name: 'John Customer'
        }
      ]]);

      // Customer 2 tries to access ticket 10
      const res = await request(app)
        .get('/api/tickets/10')
        .set('Authorization', `Bearer ${otherCustomerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/forbidden|permission/i);
    });

    test('8. Non-existent ticket ID returns 404', async () => {
      pool.execute.mockResolvedValueOnce([[]]);

      const res = await request(app)
        .get('/api/tickets/9999')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('9. Invalid non-numeric ticket ID returns 400', async () => {
      const res = await request(app)
        .get('/api/tickets/abc-not-a-number')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('10. Agent can update ticket status and priority (200)', async () => {
      // 1: find existing ticket
      // 2: execute update
      // 3: select updated ticket
      pool.execute
        .mockResolvedValueOnce([[{ id: 10, user_id: 1, status: 'Open' }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([[
          {
            id: 10,
            user_id: 1,
            subject: 'Printer issue',
            status: 'In Progress',
            priority: 'Urgent',
            assigned_to: 99,
            customer_name: 'John Customer'
          }
        ]]);

      const res = await request(app)
        .put('/api/tickets/10')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          status: 'In Progress',
          priority: 'Urgent'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.ticket.status).toBe('In Progress');
    });

    test('11. Customer is forbidden from updating ticket status (403)', async () => {
      pool.execute.mockResolvedValueOnce([[{ id: 10, user_id: mockCustomer.id, status: 'Open' }]]);

      const res = await request(app)
        .put('/api/tickets/10')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          status: 'Resolved'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test('12. Customer is forbidden from accessing agent-only /api/users endpoint (403)', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test('13. Authenticated user can add comment to ticket (201)', async () => {
      // 1: verify ticket exists
      // 2: insert comment
      // 3: select created comment
      pool.execute
        .mockResolvedValueOnce([[{ id: 10, user_id: mockCustomer.id, status: 'Open' }]])
        .mockResolvedValueOnce([{ insertId: 50 }])
        .mockResolvedValueOnce([[
          {
            id: 50,
            ticket_id: 10,
            user_id: mockCustomer.id,
            comment: 'Working on troubleshooting steps now.',
            created_at: new Date(),
            user_name: mockCustomer.name,
            user_email: mockCustomer.email,
            user_role: mockCustomer.role
          }
        ]]);

      const res = await request(app)
        .post('/api/tickets/10/comments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          comment: 'Working on troubleshooting steps now.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.comment.comment).toBe('Working on troubleshooting steps now.');
    });
  });
});
