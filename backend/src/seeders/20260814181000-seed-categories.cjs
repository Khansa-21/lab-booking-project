'use strict';

const categoryNames = [
  'Computers',
  'Microscopes',
  'Electronics',
  'Laboratory Tools',
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert(
      'Categories',
      categoryNames.map((name) => ({
        name,
        description: null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })),
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Categories', { name: categoryNames });
  },
};
