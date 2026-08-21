'use strict';

const { Op } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Equipment', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Categories',
          key: 'id',
        },
        onUpdate: 'NO ACTION',
        onDelete: 'NO ACTION',
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      imageUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'AVAILABLE',
      },
      bookingAudience: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'STUDENT_AND_TEACHER',
      },
      requiresApproval: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      maxBookingHours: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 2,
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

    await queryInterface.addConstraint('Equipment', {
      fields: ['status'],
      type: 'check',
      name: 'CK_Equipment_Status',
      where: {
        status: {
          [Op.in]: ['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE'],
        },
      },
    });

    await queryInterface.addConstraint('Equipment', {
      fields: ['bookingAudience'],
      type: 'check',
      name: 'CK_Equipment_BookingAudience',
      where: {
        bookingAudience: {
          [Op.in]: ['STUDENT_AND_TEACHER', 'TEACHER_ONLY'],
        },
      },
    });

    await queryInterface.addConstraint('Equipment', {
      fields: ['maxBookingHours'],
      type: 'check',
      name: 'CK_Equipment_MaxBookingHours',
      where: {
        maxBookingHours: {
          [Op.gt]: 0,
        },
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Equipment');
  },
};
