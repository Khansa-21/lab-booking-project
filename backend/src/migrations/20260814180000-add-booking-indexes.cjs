'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('Equipment', ['categoryId'], {
      name: 'IX_Equipment_CategoryId',
    });
    await queryInterface.addIndex('Reservations', ['userId'], {
      name: 'IX_Reservations_UserId',
    });
    await queryInterface.addIndex(
      'Reservations',
      ['equipmentId', 'status', 'startDateTime', 'endDateTime'],
      { name: 'IX_Reservations_EquipmentAvailability' },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('Reservations', 'IX_Reservations_EquipmentAvailability');
    await queryInterface.removeIndex('Reservations', 'IX_Reservations_UserId');
    await queryInterface.removeIndex('Equipment', 'IX_Equipment_CategoryId');
  },
};
