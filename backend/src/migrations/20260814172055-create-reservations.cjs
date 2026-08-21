'use strict';

const { Op } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reservations', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'NO ACTION',
        onDelete: 'NO ACTION',
      },
      equipmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Equipment',
          key: 'id',
        },
        onUpdate: 'NO ACTION',
        onDelete: 'NO ACTION',
      },
      startDateTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      endDateTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      purpose: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      reviewedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'NO ACTION',
        onDelete: 'NO ACTION',
      },
      reviewedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addConstraint('Reservations', {
      fields: ['status'],
      type: 'check',
      name: 'CK_Reservations_Status',
      where: {
        status: {
          [Op.in]: [
            'PENDING',
            'APPROVED',
            'REJECTED',
            'CANCELLED',
            'COMPLETED',
          ],
        },
      },
    });

    await queryInterface.addConstraint('Reservations', {
      fields: ['startDateTime', 'endDateTime'],
      type: 'check',
      name: 'CK_Reservations_TimeOrder',
      where: {
        startDateTime: {
          [Op.lt]: Sequelize.col('endDateTime'),
        },
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Reservations');
  },
};
