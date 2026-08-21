import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';

import { Equipment } from './equipment.model.js';
import { User } from './user.model.js';

export class TrainingRecord extends Model<
  InferAttributes<TrainingRecord>,
  InferCreationAttributes<TrainingRecord>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare equipmentId: ForeignKey<Equipment['id']>;
  declare completedBy: ForeignKey<User['id']> | null;
  declare completedAt: CreationOptional<Date>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function initializeTrainingRecordModel(sequelize: Sequelize): void {
  TrainingRecord.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      equipmentId: { type: DataTypes.INTEGER, allowNull: false },
      completedBy: { type: DataTypes.INTEGER, allowNull: true },
      completedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    { sequelize, tableName: 'TrainingRecords' },
  );
}
