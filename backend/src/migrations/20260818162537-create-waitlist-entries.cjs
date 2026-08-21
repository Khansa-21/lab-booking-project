'use strict';

const { Op } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('WaitlistEntries', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'NO ACTION',
        onDelete: 'NO ACTION',
      },
      equipmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Equipment', key: 'id' },
        onUpdate: 'NO ACTION',
        onDelete: 'NO ACTION',
      },
      startDateTime: { type: Sequelize.DATE, allowNull: false },
      endDateTime: { type: Sequelize.DATE, allowNull: false },
      purpose: { type: Sequelize.TEXT, allowNull: false },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'WAITING' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addConstraint('WaitlistEntries', {
      fields: ['status'],
      type: 'check',
      name: 'CK_WaitlistEntries_Status',
      where: { status: { [Op.in]: ['WAITING', 'PROMOTED', 'CANCELLED'] } },
    });
    await queryInterface.addConstraint('WaitlistEntries', {
      fields: ['startDateTime', 'endDateTime'],
      type: 'check',
      name: 'CK_WaitlistEntries_TimeOrder',
      where: { startDateTime: { [Op.lt]: Sequelize.col('endDateTime') } },
    });
    await queryInterface.addIndex(
      'WaitlistEntries',
      ['equipmentId', 'status', 'startDateTime', 'endDateTime'],
      { name: 'IX_WaitlistEntries_Promotion' },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('WaitlistEntries');
  },
};
