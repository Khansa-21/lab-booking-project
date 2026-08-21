'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Equipment', 'requiresTraining', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.createTable('TrainingRecords', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
      equipmentId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Equipment', key: 'id' }, onDelete: 'CASCADE' },
      completedBy: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'Users', key: 'id' }, onDelete: 'SET NULL' },
      completedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('TrainingRecords', ['userId', 'equipmentId'], {
      unique: true,
      name: 'training_records_user_equipment_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('TrainingRecords');
    await queryInterface.removeColumn('Equipment', 'requiresTraining');
  },
};
