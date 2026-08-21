import { sequelize } from '../config/database.js';
import { Category, initializeCategoryModel } from './category.model.js';
import { Equipment, initializeEquipmentModel } from './equipment.model.js';
import { Reservation, initializeReservationModel } from './reservation.model.js';
import { initializeUserModel, User } from './user.model.js';
import { initializeWaitlistEntryModel, WaitlistEntry } from './waitlist-entry.model.js';
import { initializeTrainingRecordModel, TrainingRecord } from './training-record.model.js';

initializeUserModel(sequelize);
initializeCategoryModel(sequelize);
initializeEquipmentModel(sequelize);
initializeReservationModel(sequelize);
initializeWaitlistEntryModel(sequelize);
initializeTrainingRecordModel(sequelize);

User.hasMany(Reservation, { as: 'reservations', foreignKey: 'userId' });
Reservation.belongsTo(User, { as: 'user', foreignKey: 'userId' });

User.hasMany(Reservation, {
  as: 'reviewedReservations',
  foreignKey: 'reviewedBy',
});
Reservation.belongsTo(User, { as: 'reviewer', foreignKey: 'reviewedBy' });

Category.hasMany(Equipment, { as: 'equipment', foreignKey: 'categoryId' });
Equipment.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });

Equipment.hasMany(Reservation, {
  as: 'reservations',
  foreignKey: 'equipmentId',
});
Reservation.belongsTo(Equipment, {
  as: 'equipment',
  foreignKey: 'equipmentId',
});

User.hasMany(WaitlistEntry, { as: 'waitlistEntries', foreignKey: 'userId' });
WaitlistEntry.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Equipment.hasMany(WaitlistEntry, { as: 'waitlistEntries', foreignKey: 'equipmentId' });
WaitlistEntry.belongsTo(Equipment, { as: 'equipment', foreignKey: 'equipmentId' });

User.hasMany(TrainingRecord, { as: 'trainingRecords', foreignKey: 'userId' });
TrainingRecord.belongsTo(User, { as: 'user', foreignKey: 'userId' });
TrainingRecord.belongsTo(User, { as: 'completedByUser', foreignKey: 'completedBy' });
Equipment.hasMany(TrainingRecord, { as: 'trainingRecords', foreignKey: 'equipmentId' });
TrainingRecord.belongsTo(Equipment, { as: 'equipment', foreignKey: 'equipmentId' });

export { Category, Equipment, Reservation, TrainingRecord, User, WaitlistEntry };
