'use strict';

const resources = [
  { name: 'UI Test Open Camera', location: 'Media Lab', status: 'AVAILABLE', requiresApproval: false, requiresTraining: false },
  { name: 'UI Test Approval Projector', location: 'Seminar Room', status: 'AVAILABLE', requiresApproval: true, requiresTraining: false },
  { name: 'UI Test Training Microscope', location: 'Biology Lab', status: 'AVAILABLE', requiresApproval: false, requiresTraining: true },
  { name: 'UI Test Maintenance Camera', location: 'Media Store', status: 'MAINTENANCE', requiresApproval: false, requiresTraining: false },
];

/** Development-only data for manually testing the full UI flow. */
module.exports = {
  async up(queryInterface) {
    const [categories] = await queryInterface.sequelize.query("SELECT id, name FROM Categories WHERE name IN ('Electronics', 'Microscopes')");
    const categoryByName = new Map(categories.map((item) => [item.name, item.id]));
    const [users] = await queryInterface.sequelize.query("SELECT id, email FROM Users WHERE email IN ('student@lab.local', 'teacher@lab.local')");
    const userByEmail = new Map(users.map((item) => [item.email, item.id]));

    if (!categoryByName.size || !userByEmail.size) {
      throw new Error('Run the base category and development-user seeders before this UI test seeder.');
    }

    const [existingResources] = await queryInterface.sequelize.query('SELECT id, name FROM Equipment');
    const resourceByName = new Map(existingResources.map((item) => [item.name, item.id]));
    const now = new Date();
    const rows = resources
      .filter((item) => !resourceByName.has(item.name))
      .map((item) => ({
        categoryId: categoryByName.get(item.name.includes('Microscope') ? 'Microscopes' : 'Electronics'),
        name: item.name,
        description: 'Development-only UI testing resource.',
        location: item.location,
        imageUrl: null,
        status: item.status,
        bookingAudience: 'STUDENT_AND_TEACHER',
        requiresApproval: item.requiresApproval,
        requiresTraining: item.requiresTraining,
        maxBookingHours: 2,
        createdAt: now,
        updatedAt: now,
      }));
    if (rows.length) await queryInterface.bulkInsert('Equipment', rows);

    const [allResources] = await queryInterface.sequelize.query("SELECT id, name FROM Equipment WHERE name LIKE 'UI Test %'");
    for (const item of allResources) resourceByName.set(item.name, item.id);

    const start = new Date(Date.now() + 15 * 60 * 1000);
    const end = new Date(Date.now() + 75 * 60 * 1000);
    const [existingReservations] = await queryInterface.sequelize.query("SELECT id FROM Reservations WHERE purpose = 'UI TEST: approved booking'");
    if (!existingReservations.length) {
      await queryInterface.bulkInsert('Reservations', [{
        userId: userByEmail.get('student@lab.local'),
        equipmentId: resourceByName.get('UI Test Open Camera'),
        startDateTime: start,
        endDateTime: end,
        purpose: 'UI TEST: approved booking',
        status: 'APPROVED',
        reviewedBy: null,
        reviewedAt: null,
        checkInCode: 'UITESTCHECK1',
        checkedInAt: null,
        createdAt: now,
        updatedAt: now,
      }]);
    }

    const [existingPending] = await queryInterface.sequelize.query("SELECT id FROM Reservations WHERE purpose = 'UI TEST: approval request'");
    if (!existingPending.length) {
      await queryInterface.bulkInsert('Reservations', [{
        userId: userByEmail.get('student@lab.local'),
        equipmentId: resourceByName.get('UI Test Approval Projector'),
        startDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        endDateTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
        purpose: 'UI TEST: approval request',
        status: 'PENDING',
        reviewedBy: null,
        reviewedAt: null,
        checkInCode: 'UITESTPEND01',
        checkedInAt: null,
        createdAt: now,
        updatedAt: now,
      }]);
    }

    const [existingWaitlist] = await queryInterface.sequelize.query("SELECT id FROM WaitlistEntries WHERE purpose = 'UI TEST: waitlist request'");
    if (!existingWaitlist.length) {
      await queryInterface.bulkInsert('WaitlistEntries', [{
        userId: userByEmail.get('teacher@lab.local'),
        equipmentId: resourceByName.get('UI Test Approval Projector'),
        startDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        endDateTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
        purpose: 'UI TEST: waitlist request',
        status: 'WAITING',
        createdAt: now,
        updatedAt: now,
      }]);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('WaitlistEntries', { purpose: 'UI TEST: waitlist request' });
    await queryInterface.bulkDelete('Reservations', { purpose: ['UI TEST: approved booking', 'UI TEST: approval request'] });
    await queryInterface.bulkDelete('Equipment', { name: resources.map((item) => item.name) });
  },
};
