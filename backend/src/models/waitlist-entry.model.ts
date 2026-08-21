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
import { WAITLIST_STATUSES, WaitlistStatus } from './model-values.js';

export class WaitlistEntry extends Model<
  InferAttributes<WaitlistEntry>,
  InferCreationAttributes<WaitlistEntry>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare equipmentId: ForeignKey<Equipment['id']>;
  declare startDateTime: Date;
  declare endDateTime: Date;
  declare purpose: string;
  declare status: CreationOptional<WaitlistStatus>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function initializeWaitlistEntryModel(sequelize: Sequelize): void {
  WaitlistEntry.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      startDateTime: { type: DataTypes.DATE, allowNull: false },
      endDateTime: { type: DataTypes.DATE, allowNull: false },
      purpose: { type: DataTypes.TEXT, allowNull: false },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'WAITING',
        validate: { isIn: [[...WAITLIST_STATUSES]] },
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    { sequelize, tableName: 'WaitlistEntries' },
  );
}
