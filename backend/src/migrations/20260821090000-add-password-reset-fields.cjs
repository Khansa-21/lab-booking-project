'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'passwordResetTokenHash', {
      type: Sequelize.STRING(64),
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'passwordResetExpiresAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addIndex('Users', ['passwordResetTokenHash'], {
      name: 'users_password_reset_token_hash',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('Users', 'users_password_reset_token_hash');
    await queryInterface.removeColumn('Users', 'passwordResetExpiresAt');
    await queryInterface.removeColumn('Users', 'passwordResetTokenHash');
  },
};
