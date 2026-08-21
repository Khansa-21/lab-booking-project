'use strict';

const equipment = [
  { name: 'Canon DSLR #02', category: 'Electronics', location: 'Media Lab', requiresTraining: true, maxBookingHours: 4 },
  { name: 'Projector #01', category: 'Electronics', location: 'Seminar Room', requiresTraining: false, maxBookingHours: 3 },
  { name: 'Microscope #03', category: 'Microscopes', location: 'Biology Lab', requiresTraining: true, maxBookingHours: 2 },
  { name: 'Workstation #04', category: 'Computers', location: 'Computer Lab A', requiresTraining: false, maxBookingHours: 3 },
];

/** Development-only demo data. It does not modify existing equipment. */
module.exports = {
  async up(queryInterface) {
    const [categories] = await queryInterface.sequelize.query('SELECT id, name FROM Categories');
    const categoryIds = new Map(categories.map((category) => [category.name, category.id]));
    const [existing] = await queryInterface.sequelize.query('SELECT name FROM Equipment');
    const existingNames = new Set(existing.map((item) => item.name));
    const now = new Date();
    const rows = equipment
      .filter((item) => categoryIds.has(item.category) && !existingNames.has(item.name))
      .map((item) => ({
        categoryId: categoryIds.get(item.category), name: item.name,
        description: 'Development demonstration resource.', location: item.location, imageUrl: null,
        status: 'AVAILABLE', bookingAudience: 'STUDENT_AND_TEACHER', requiresApproval: false,
        requiresTraining: item.requiresTraining, maxBookingHours: item.maxBookingHours,
        createdAt: now, updatedAt: now,
      }));
    if (rows.length) await queryInterface.bulkInsert('Equipment', rows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Equipment', { name: equipment.map((item) => item.name) });
  },
};
