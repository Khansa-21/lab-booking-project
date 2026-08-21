import { UniqueConstraintError } from 'sequelize';

import { AppError } from '../errors/app-error.js';
import { Category, Equipment } from '../models/index.js';
import {
  CreateCategoryInput,
  CreateEquipmentInput,
  UpdateCategoryInput,
  UpdateEquipmentInput,
} from '../validators/admin-resource.validator.js';

export async function getAdminResources(): Promise<{
  categories: Category[];
  equipment: Equipment[];
}> {
  const [categories, equipment] = await Promise.all([
    Category.findAll({ order: [['name', 'ASC']] }),
    Equipment.findAll({
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      order: [['name', 'ASC']],
    }),
  ]);
  return { categories, equipment };
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  try {
    return await Category.create({
      name: input.name,
      description: input.description ?? null,
      isActive: input.isActive,
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new AppError(409, 'A category with this name already exists.');
    }
    throw error;
  }
}

export async function updateCategory(
  id: number,
  input: UpdateCategoryInput,
): Promise<Category> {
  const category = await Category.findByPk(id);
  if (!category) throw new AppError(404, 'Category not found.');

  try {
    await category.update(input);
    return category;
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new AppError(409, 'A category with this name already exists.');
    }
    throw error;
  }
}

export async function createEquipment(input: CreateEquipmentInput): Promise<Equipment> {
  await requireActiveCategory(input.categoryId);
  return Equipment.create({
    ...input,
    description: input.description ?? null,
    imageUrl: input.imageUrl ?? null,
  });
}

export async function updateEquipment(
  id: number,
  input: UpdateEquipmentInput,
): Promise<Equipment> {
  const equipment = await Equipment.findByPk(id);
  if (!equipment) throw new AppError(404, 'Equipment not found.');
  if (input.categoryId) await requireActiveCategory(input.categoryId);

  await equipment.update(input);
  return equipment;
}

async function requireActiveCategory(categoryId: number): Promise<void> {
  const category = await Category.findByPk(categoryId);
  if (!category || !category.isActive) {
    throw new AppError(400, 'Select an active category.');
  }
}
