import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import request from 'supertest';

import { app } from '../src/app.js';
import { sequelize } from '../src/config/database.js';
import { Category, Equipment, Reservation, User } from '../src/models/index.js';

const email = `auth-test-${Date.now()}@lab.local`;
const password = 'ValidTest@123';
const agent = request.agent(app);
let testCategoryId: number | undefined;
let testEquipmentId: number | undefined;

before(async () => {
  await sequelize.authenticate();
});

after(async () => {
  if (testEquipmentId) {
    await Reservation.destroy({ where: { equipmentId: testEquipmentId } });
    await Equipment.destroy({ where: { id: testEquipmentId } });
  }
  if (testCategoryId) await Category.destroy({ where: { id: testCategoryId } });
  await User.destroy({ where: { email } });
  await sequelize.close();
});

test('signup creates a STUDENT and sets an HttpOnly cookie', async () => {
  const response = await agent
    .post('/api/auth/signup')
    .send({ name: 'Auth Test User', email, password })
    .expect(201);

  assert.equal(response.body.user.role, 'STUDENT');
  assert.equal('passwordHash' in response.body.user, false);
  assert.match(response.headers['set-cookie'][0], /HttpOnly/);
});

test('authenticated cookie can retrieve the current user', async () => {
  const response = await agent.get('/api/auth/me').expect(200);
  assert.equal(response.body.user.email, email);
});

test('authenticated user can load catalogue data', async () => {
  const categoriesResponse = await agent.get('/api/categories').expect(200);
  const equipmentResponse = await agent.get('/api/equipment').expect(200);

  assert.equal(Array.isArray(categoriesResponse.body.categories), true);
  assert.equal(Array.isArray(equipmentResponse.body.equipment), true);
});

test('equipment filters reject invalid category IDs', async () => {
  await agent.get('/api/equipment?categoryId=invalid').expect(400);
});

test('reservation creation rejects overlaps and supports cancellation', async () => {
  const category = await Category.create({
    name: `Test Category ${Date.now()}`,
    description: 'Temporary integration-test category',
  });
  testCategoryId = category.id;

  const equipment = await Equipment.create({
    categoryId: category.id,
    name: 'Integration Test Equipment',
    description: 'Temporary integration-test equipment',
    location: 'Test Lab',
    status: 'AVAILABLE',
    bookingAudience: 'STUDENT_AND_TEACHER',
    requiresApproval: false,
    maxBookingHours: 4,
  });
  testEquipmentId = equipment.id;

  const startDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000);
  const payload = {
    equipmentId: equipment.id,
    startDateTime: startDateTime.toISOString(),
    endDateTime: endDateTime.toISOString(),
    purpose: 'Integration test booking',
  };

  const created = await agent.post('/api/reservations').send(payload).expect(201);
  assert.equal(created.body.reservation.status, 'APPROVED');

  await agent.post('/api/reservations').send(payload).expect(409);
  await agent.patch(`/api/reservations/${created.body.reservation.id}/cancel`).expect(200);
});

test('logout clears the cookie', async () => {
  await agent.post('/api/auth/logout').expect(204);
  await agent.get('/api/auth/me').expect(401);
});

test('login rejects an incorrect password', async () => {
  await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'WrongPassword@123' })
    .expect(401);
});

test('login accepts the correct password', async () => {
  await request(app).post('/api/auth/login').send({ email, password }).expect(200);
});
