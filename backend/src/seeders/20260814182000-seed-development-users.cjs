'use strict';

const bcrypt = require('bcrypt');

const users = [
  { name: 'Development Student', email: 'student@lab.local', role: 'STUDENT' },
  { name: 'Development Teacher', email: 'teacher@lab.local', role: 'TEACHER' },
  { name: 'Development Admin', email: 'admin@lab.local', role: 'ADMIN' },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const password = process.env.SEED_USER_PASSWORD;

    const validPassword =
      password &&
      password.length >= 8 &&
      password.length <= 30 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password);

    if (!validPassword) {
      throw new Error('SEED_USER_PASSWORD must be 8–30 characters with upper, lower, number and special character.');
    }

    const now = new Date();
    const passwordHash = await bcrypt.hash(password, 12);

    await queryInterface.bulkInsert(
      'Users',
      users.map((user) => ({
        ...user,
        passwordHash,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })),
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Users', {
      email: users.map((user) => user.email),
    });
  },
};
