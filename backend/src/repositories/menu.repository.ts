import { MenuItem, IMenuItem } from '../models/MenuItem.js';

export class MenuRepository {
  async findAll(availableOnly = false): Promise<IMenuItem[]> {
    const query = availableOnly ? { isAvailable: true } : {};
    return MenuItem.find(query).sort({ category: 1, name: 1 }).exec();
  }

  async findById(id: string): Promise<IMenuItem | null> {
    return MenuItem.findById(id).exec();
  }

  async findByIds(ids: string[]): Promise<IMenuItem[]> {
    return MenuItem.find({ _id: { $in: ids } }).exec();
  }

  async create(data: Partial<IMenuItem>): Promise<IMenuItem> {
    return MenuItem.create(data);
  }

  async count(): Promise<number> {
    return MenuItem.countDocuments().exec();
  }
}

export const menuRepository = new MenuRepository();
