import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';

import { Category } from './category.model.js';
import {
  BOOKING_AUDIENCES,
  BookingAudience,
  EQUIPMENT_STATUSES,
  EquipmentStatus,
} from './model-values.js';

export class Equipment extends Model<
  InferAttributes<Equipment>,
  InferCreationAttributes<Equipment>
> {
  declare id: CreationOptional<number>;
  declare categoryId: ForeignKey<Category['id']>;
  declare name: string;
  declare description: string | null;
  declare location: string;
  declare imageUrl: string | null;
  declare status: CreationOptional<EquipmentStatus>;
  declare bookingAudience: CreationOptional<BookingAudience>;
  declare requiresApproval: CreationOptional<boolean>;
  declare requiresTraining: CreationOptional<boolean>;
  declare maxBookingHours: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function initializeEquipmentModel(sequelize: Sequelize): void {
  Equipment.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(150), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      location: { type: DataTypes.STRING(150), allowNull: false },
      imageUrl: { type: DataTypes.STRING(500), allowNull: true },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'AVAILABLE',
        validate: { isIn: [[...EQUIPMENT_STATUSES]] },
      },
      bookingAudience: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'STUDENT_AND_TEACHER',
        validate: { isIn: [[...BOOKING_AUDIENCES]] },
      },
      requiresApproval: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      requiresTraining: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      maxBookingHours: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 2,
        validate: { min: 0.01 },
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    { sequelize, tableName: 'Equipment' },
  );
}
