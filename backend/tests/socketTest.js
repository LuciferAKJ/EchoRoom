const http = require('http');
const { Server } = require('socket.io');
const ioClient = require('socket.io-client');
const request = require('supertest');
const { app } = require('../server');
const { connectDB } = require('../src/config/db');
const { initRoomSocket } = require('../src/socket/roomSocket');

const runSocketTest = async () => {
  await connectDB();

  // Create dedicated test server on an ephemeral port
  const testServer = http.createServer(app);
  const testIo = new Server(testServer, {
    cors: { origin: '*' },
  });
  initRoomSocket(testIo);

  const TEST_PORT = 5099;
  await new Promise((resolve) => testServer.listen(TEST_PORT, resolve));
  console.log(`[Socket Test] Test server running on port ${TEST_PORT}`);

  try {
    const rand = Date.now();

    // 0. Test Unauthorized Socket Connection (Without Token)
    const unauthorizedClient = ioClient(`http://localhost:${TEST_PORT}`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    const unauthError = await new Promise((resolve) => {
      unauthorizedClient.on('connect_error', (err) => {
        resolve(err.message);
      });
    });
    unauthorizedClient.disconnect();
    console.log(`✓ Unauthorized socket connection rejected: "${unauthError}"`);

    // 1. Register User A
    const userARes = await request(app)
      .post('/api/auth/register')
      .send({ email: `socketA_${rand}@test.edu`, password: 'password123' });
    const tokenA = userARes.body.token;
    const pseudonymA = userARes.body.identity.pseudonym;
    console.log(`User A registered: ${pseudonymA}`);

    // 2. Register User B
    const userBRes = await request(app)
      .post('/api/auth/register')
      .send({ email: `socketB_${rand}@test.edu`, password: 'password123' });
    const tokenB = userBRes.body.token;
    const pseudonymB = userBRes.body.identity.pseudonym;
    console.log(`User B registered: ${pseudonymB}`);

    // 3. User A creates a discussion room
    const roomRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: `Late Night Reflections #${rand % 1000}`,
        topic: 'Solitude & Peace',
      });
    const roomId = roomRes.body.data._id;
    console.log(`Discussion room created: ${roomId}`);

    // 4. Connect Client A via Socket.IO
    const clientA = ioClient(`http://localhost:${TEST_PORT}`, {
      auth: { token: tokenA },
      transports: ['websocket'],
    });

    // 5. Connect Client B via Socket.IO
    const clientB = ioClient(`http://localhost:${TEST_PORT}`, {
      auth: { token: tokenB },
      transports: ['websocket'],
    });

    // Wait for both connections
    await Promise.all([
      new Promise((resolve) => clientA.on('connect', resolve)),
      new Promise((resolve) => clientB.on('connect', resolve)),
    ]);
    console.log('✓ Both socket clients connected with authenticated JWT handshakes');

    // 5.5. Verify Client B CANNOT send message into room before joining
    const unauthorizedMsgPromise = new Promise((resolve) => {
      clientB.on('room:error', (err) => {
        resolve(err.message);
      });
    });
    clientB.emit('message:send', { roomId, message: 'Unjoined intrusion attempt' });
    const authErrorMsg = await unauthorizedMsgPromise;
    if (authErrorMsg !== 'You must join this room before sending messages') {
      throw new Error(`Expected join check error, got: ${authErrorMsg}`);
    }
    console.log(`✓ Unauthorized message emission without joining rejected: "${authErrorMsg}"`);

    // 6. Client A joins room
    const joinAPromise = new Promise((resolve) => {
      clientA.on('room:joined', (data) => {
        console.log(`✓ Client A received room:joined for ${data.room.title}`);
        resolve(data);
      });
    });
    clientA.emit('room:join', { roomId });
    await joinAPromise;

    // 7. Client B joins room & verify participant count = 2
    const participantPromise = new Promise((resolve) => {
      clientA.on('room:participants', (data) => {
        if (data.count === 2) {
          console.log(`✓ Client A received room:participants broadcast showing count = 2`);
          resolve(data);
        }
      });
    });
    clientB.emit('room:join', { roomId });
    await participantPromise;

    // 8. Client A sends message, Client B receives message
    const msgPromise = new Promise((resolve) => {
      clientB.on('room:message', (data) => {
        console.log(`✓ Client B received real-time room:message from "${data.senderIdentity.pseudonym}": "${data.message}"`);
        resolve(data);
      });
    });
    clientA.emit('message:send', { roomId, message: 'Hello from User A in the quiet echoes!' });
    const receivedMsg = await msgPromise;

    if (receivedMsg.message !== 'Hello from User A in the quiet echoes!') {
      throw new Error('Message text mismatch');
    }

    // 9. Client B leaves room -> Client A receives updated participant count = 1
    const leavePromise = new Promise((resolve) => {
      clientA.on('room:participants', (data) => {
        if (data.count === 1) {
          console.log(`✓ Client A received room:participants broadcast showing count = 1 after Client B left`);
          resolve(data);
        }
      });
    });
    clientB.emit('room:leave', { roomId });
    await leavePromise;

    // Rejoin Client B to verify room closure broadcast
    clientB.emit('room:join', { roomId });
    await new Promise((r) => setTimeout(r, 200));

    // 10. Close room via User A HTTP endpoint and verify broadcast to Client B
    const closePromise = new Promise((resolve) => {
      clientB.on('room:closed', (data) => {
        console.log(`✓ Client B received room:closed event: "${data.message}"`);
        resolve(data);
      });
    });

    // Attach io to app for close endpoint
    app.set('io', testIo);
    await request(app)
      .post(`/api/rooms/${roomId}/close`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    await closePromise;

    // Cleanup sockets and server
    clientA.disconnect();
    clientB.disconnect();
    testServer.close();

    // Clean up created test documents from test database
    try {
      const User = require('../src/models/User');
      const AnonymousIdentity = require('../src/models/AnonymousIdentity');
      const DiscussionRoom = require('../src/models/DiscussionRoom');
      const RoomMessage = require('../src/models/RoomMessage');

      const testUserIds = [userARes.body.user._id, userBRes.body.user._id].filter(Boolean);
      await User.deleteMany({ _id: { $in: testUserIds } });
      await AnonymousIdentity.deleteMany({ userId: { $in: testUserIds } });
      if (roomId) {
        await DiscussionRoom.findByIdAndDelete(roomId);
        await RoomMessage.deleteMany({ room: roomId });
      }
    } catch (cleanupErr) {
      console.warn('Socket test data cleanup warning:', cleanupErr.message);
    }

    console.log('ALL STEP 7 SOCKET.IO REAL-TIME VERIFICATION TESTS PASSED!');
    process.exit(0);
  } catch (err) {
    console.error('Socket test error:', err);
    testServer.close();
    process.exit(1);
  }
};

runSocketTest();
