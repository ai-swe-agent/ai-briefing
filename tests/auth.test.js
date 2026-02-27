const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let app;
let mongoServer;

const validUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'SecurePass123!'
};

describe('Authentication API', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    app = require('../src/app');
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  });

  describe('POST /api/auth/register', () => {
    test('should create new user with valid input', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('username', validUser.username);
      expect(response.body.data).toHaveProperty('email', validUser.email);
      expect(response.body.data).not.toHaveProperty('password');
    });

    test('should store password as hashed value', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(validUser);

      const User = require('../src/models/user.model');
      const user = await User.findOne({ email: validUser.email }).select('+password');

      expect(user.password).not.toBe(validUser.password);
      const isHashed = await bcrypt.compare(validUser.password, user.password);
      expect(isHashed).toBe(true);
    });

    test('should reject registration without username', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: validUser.email, password: validUser.password });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    test('should reject registration without email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: validUser.username, password: validUser.password });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject registration without password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: validUser.username, email: validUser.email });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, email: 'invalid-email' });

      expect(response.status).toBe(400);
    });

    test('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, password: '123' });

      expect(response.status).toBe(400);
    });

    test('should reject duplicate email', async () => {
      await request(app).post('/api/auth/register').send(validUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'different', email: validUser.email, password: validUser.password });

      expect(response.status).toBe(409);
    });

    test('should reject duplicate username', async () => {
      await request(app).post('/api/auth/register').send(validUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: validUser.username, email: 'different@example.com', password: validUser.password });

      expect(response.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(validUser);
    });

    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
    });

    test('should return valid JWT token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password });

      const token = response.body.data.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('email', validUser.email);
    });

    test('should reject incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should reject non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: validUser.password });

      expect(response.status).toBe(401);
    });

    test('should not expose user enumeration', async () => {
      const validEmailResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: 'wrong' });

      const invalidEmailResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'wrong' });

      expect(validEmailResponse.body.error.message).toBe(invalidEmailResponse.body.error.message);
    });

    test('should accept email case-insensitively', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email.toUpperCase(), password: validUser.password });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken;

    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(validUser);
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password });
      authToken = loginResponse.body.data.token;
    });

    test('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe(validUser.email);
    });

    test('should reject request without token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    test('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    test('should not return password', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data).not.toHaveProperty('password');
    });
  });

  describe('Security', () => {
    test('should set security headers', async () => {
      const response = await request(app).get('/api/health');

      expect(response.headers['x-content-type-options']).toBeDefined();
    });

    test('should sanitize NoSQL injection in login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: { $gt: '' }, password: 'test' });

      expect(response.status).toBe(400);
    });
  });
});
