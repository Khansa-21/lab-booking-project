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
import { RESERVATION_STATUSES, ReservationStatus } from './model-values.js';
import { User } from './user.model.js';

export class Reservation extends Model<
  InferAttributes<Reservation>,
  InferCreationAttributes<Reservation>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare equipmentId: ForeignKey<Equipment['id']>;
  declare startDateTime: Date;
  declare endDateTime: Date;
  declare purpose: string;
  declare status: ReservationStatus;
  declare reviewedBy: ForeignKey<User['id']> | null;
  declare reviewedAt: Date | null;
  declare checkInCode: string | null;
  declare checkedInAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function initializeReservationModel(sequelize: Sequelize): void {
  Reservation.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      startDateTime: { type: DataTypes.DATE, allowNull: false },
      endDateTime: { type: DataTypes.DATE, allowNull: false },
      purpose: { type: DataTypes.TEXT, allowNull: false },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: { isIn: [[...RESERVATION_STATUSES]] },
      },
      reviewedAt: { type: DataTypes.DATE, allowNull: true },
      checkInCode: { type: DataTypes.STRING(32), allowNull: true, unique: true },
      checkedInAt: { type: DataTypes.DATE, allowNull: true },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    { sequelize, tableName: 'Reservations' },
  );
}
