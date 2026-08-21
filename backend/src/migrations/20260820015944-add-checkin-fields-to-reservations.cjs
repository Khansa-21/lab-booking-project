'use strict';

const { Op } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Reservations', 'checkInCode', { type: Sequelize.STRING(32), allowNull: true });
    await queryInterface.addColumn('Reservations', 'checkedInAt', { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addIndex('Reservations', ['checkInCode'], { unique: true, name: 'reservations_check_in_code_unique' });
    await queryInterface.removeConstraint('Reservations', 'CK_Reservations_Status');
    await queryInterface.addConstraint('Reservations', {
      fields: ['status'], type: 'check', name: 'CK_Reservations_Status',
      where: { status: { [Op.in]: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'] } },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('Reservations', 'CK_Reservations_Status');
    await queryInterface.addConstraint('Reservations', {
      fields: ['status'], type: 'check', name: 'CK_Reservations_Status',
      where: { status: { [Op.in]: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'] } },
    });
    await queryInterface.removeIndex('Reservations', 'reservations_check_in_code_unique');
    await queryInterface.removeColumn('Reservations', 'checkedInAt');
    await queryInterface.removeColumn('Reservations', 'checkInCode');
  },
};
