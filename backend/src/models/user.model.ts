import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';

import { USER_ROLES, UserRole } from './model-values.js';

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare passwordHash: string;
  declare role: UserRole;
  declare isActive: CreationOptional<boolean>;
  declare passwordResetTokenHash: string | null;
  declare passwordResetExpiresAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function initializeUserModel(sequelize: Sequelize): void {
  User.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      passwordHash: { type: DataTypes.STRING(255), allowNull: false },
      role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: { isIn: [[...USER_ROLES]] },
      },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      passwordResetTokenHash: { type: DataTypes.STRING(64), allowNull: true },
      passwordResetExpiresAt: { type: DataTypes.DATE, allowNull: true },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    { sequelize, tableName: 'Users' },
  );
}
