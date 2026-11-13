process.env.NODE_ENV = 'test';
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app } = require('../server');
const { connectDB } = require('../src/config/db');
const mongoose = require('mongoose');

// Shared test variables
let authToken = '';
let userId = '';
let otherUserToken = '';
let otherUserId = '';
let testThoughtId = '';
const testEmail = `tester_${Date.now()}@university.edu`;
const otherEmail = `other_${Date.now()}@university.edu`;
const testPassword = 'Password123!';

before(async () => {
  await connectDB();
});

after(async () => {
  // Clean up any test records
  try {
    const User = require('../src/models/User');
    const Thought = require('../src/models/Thought');
    const AnonymousIdentity = require('../src/models/AnonymousIdentity');
    const EmpathyResponse = require('../src/models/EmpathyResponse');
    const Comment = require('../src/models/Comment');
    const Report = require('../src/models/Report');
    const SavedThought = require('../src/models/SavedThought');

    const userIds = [userId, otherUserId].filter(Boolean);
    if (userIds.length > 0) {
      await User.deleteMany({ _id: { $in: userIds } });
      await AnonymousIdentity.deleteMany({ userId: { $in: userIds } });
      await EmpathyResponse.deleteMany({ user: { $in: userIds } });
      await Comment.deleteMany({ authorUser: { $in: userIds } });
      await SavedThought.deleteMany({ user: { $in: userIds } });
    }
    if (testThoughtId) {
      await Thought.findByIdAndDelete(testThoughtId);
      await Report.deleteMany({ targetId: testThoughtId });
    }
  } catch (err) {
    console.error('Test cleanup error:', err);
  } finally {
    await mongoose.connection.close();
  }
});

describe('1. System & Health Check', () => {
  test('GET /api/health should return 200 with service status and database state', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.service, 'EchoRoom API');
    assert.ok(res.body.database);
    assert.equal(res.body.database.readyState, 1); // 1 = connected
  });
});

describe('2. Authentication & Identity Flow', () => {
  test('POST /api/auth/register should create user and return JWT and identity', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: testPassword });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token, 'Should return JWT token');
    assert.ok(res.body.user._id, 'Should return user id');
    assert.ok(res.body.identity.pseudonym, 'Should generate anonymous pseudonym');
    assert.equal(res.body.user.passwordHash, undefined, 'Must NEVER return passwordHash');

    authToken = res.body.token;
    userId = res.body.user._id;

    // Also register a secondary user to test authorization boundaries
    const otherRes = await request(app)
      .post('/api/auth/register')
      .send({ email: otherEmail, password: testPassword });
    otherUserToken = otherRes.body.token;
    otherUserId = otherRes.body.user._id;
  });

  test('POST /api/auth/register with duplicate email should return 409 conflict error', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: testPassword });

    assert.equal(res.status, 409);
    assert.match(res.body.message, /already exists/i);
  });

  test('POST /api/auth/login with valid credentials should return token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
  });

  test('POST /api/auth/login with invalid password should return 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'WrongPassword999!' });

    assert.equal(res.status, 401);
    assert.match(res.body.message, /invalid/i);
  });

  test('GET /api/auth/me should return current user profile and identity', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user._id.toString(), userId.toString());
    assert.ok(res.body.identity.pseudonym);
  });
});

describe('3. Thoughts CRUD, Editing & Authorization', () => {
  test('POST /api/thoughts should create a thought with valid emotion', async () => {
    const res = await request(app)
      .post('/api/thoughts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        content: 'This is an automated test thought validating Step 9 testing requirements.',
        emotion: 'Hopeful',
        topics: ['testing', 'university'],
        expirationSetting: '24h',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.emotion, 'Hopeful');
    assert.ok(res.body.data.authorIdentity);
    assert.ok(res.body.data.expiresAt);

    testThoughtId = res.body.data._id;
  });

  test('POST /api/thoughts should reject invalid emotion enum', async () => {
    const res = await request(app)
      .post('/api/thoughts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        content: 'Testing invalid emotion submission.',
        emotion: 'SuperAngryInvalidEmotion',
      });

    assert.equal(res.status, 400);
    assert.match(res.body.message, /invalid emotion/i);
  });

  test('PATCH /api/thoughts/:id allows original author to edit content', async () => {
    const res = await request(app)
      .patch(`/api/thoughts/${testThoughtId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: 'Updated content by original author.' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.content, 'Updated content by original author.');
  });

  test('PATCH /api/thoughts/:id prevents other users from editing (403)', async () => {
    const res = await request(app)
      .patch(`/api/thoughts/${testThoughtId}`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ content: 'Malicious modification attempt.' });

    assert.equal(res.status, 403);
    assert.match(res.body.message, /only edit thoughts you personally shared/i);
  });

  test('DELETE /api/thoughts/:id prevents unauthorized users from deleting (403)', async () => {
    const res = await request(app)
      .delete(`/api/thoughts/${testThoughtId}`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    assert.equal(res.status, 403);
    assert.match(res.body.message, /not authorized/i);
  });

  test('GET /api/thoughts should return paginated list filtered by emotion', async () => {
    const res = await request(app)
      .get('/api/thoughts?emotion=Hopeful&limit=5');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.pagination);
    assert.ok(res.body.data.length > 0);
  });

  test('GET /api/thoughts/:id should return single thought with populated author', async () => {
    const res = await request(app).get(`/api/thoughts/${testThoughtId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data._id.toString(), testThoughtId.toString());
    assert.ok(res.body.data.authorIdentity.pseudonym);
  });

  test('GET /api/thoughts/discover should return a random thought', async () => {
    const res = await request(app).get('/api/thoughts/discover');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data);
  });

  test('GET /api/thoughts/search should find thought by content keyword', async () => {
    const res = await request(app).get('/api/thoughts/search?q=Updated');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });
});

describe('4. Empathy Reactions & Comments', () => {
  test('POST /api/thoughts/:id/empathy should toggle empathy response', async () => {
    const res = await request(app)
      .post(`/api/thoughts/${testThoughtId}/empathy`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ reactionType: 'relate' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.action, 'added');
    assert.equal(res.body.empathyCounts.relate, 1);
  });

  test('POST /api/thoughts/:id/empathy toggling same reaction removes it', async () => {
    const res = await request(app)
      .post(`/api/thoughts/${testThoughtId}/empathy`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ reactionType: 'relate' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.action, 'removed');
    assert.equal(res.body.empathyCounts.relate, 0);
  });

  test('POST /api/thoughts/:id/comments should add a comment anonymously', async () => {
    const res = await request(app)
      .post(`/api/thoughts/${testThoughtId}/comments`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: 'Thank you for sharing, sending encouragement!' });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.authorIdentity.pseudonym);
  });

  test('GET /api/thoughts/:id/comments should retrieve comments list', async () => {
    const res = await request(app).get(`/api/thoughts/${testThoughtId}/comments`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.equal(res.body.data.length, 1);
  });
});

describe('5. Saved Thoughts (Bookmarks)', () => {
  test('POST /api/thoughts/:id/save should bookmark thought for user', async () => {
    const res = await request(app)
      .post(`/api/thoughts/${testThoughtId}/save`)
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.isSaved, true);
  });

  test('GET /api/saved should list saved thoughts', async () => {
    const res = await request(app)
      .get('/api/saved')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.equal(res.body.data.length, 1);
  });
});

describe('6. Analytics & Moderation Authorization', () => {
  test('GET /api/analytics/community should return emotional trends and counts', async () => {
    const res = await request(app).get('/api/analytics/community');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.totalActiveThoughts !== undefined);
    assert.ok(res.body.data.dominantEmotion);
    assert.ok(Array.isArray(res.body.data.emotionDistribution));
  });

  test('POST /api/reports should allow reporting content with reason', async () => {
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        targetModel: 'Thought',
        targetId: testThoughtId,
        reason: 'spam',
        details: 'Automated test report submission',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'pending');
  });

  test('GET /api/admin/reports rejects non-admin users with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/reports')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 403);
    assert.match(res.body.message, /not have permission/i);
  });
});
