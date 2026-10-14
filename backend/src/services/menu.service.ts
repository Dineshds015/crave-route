import { menuRepository } from '../repositories/menu.repository.js';
import { IMenuItem } from '../models/MenuItem.js';

export class MenuService {
  async getMenu(availableOnly = false): Promise<IMenuItem[]> {
    return menuRepository.findAll(availableOnly);
  }

  async getMenuItem(id: string): Promise<IMenuItem | null> {
    return menuRepository.findById(id);
  }

  async validateAndResolveOrderItems(
    itemsInput: { menuItemId: string; quantity: number }[]
  ): Promise<{
    items: {
      menuItemId: any;
      name: string;
      unitPrice: number;
      quantity: number;
      itemTotal: number;
    }[];
    subtotal: number;
  }> {
    const ids = itemsInput.map(i => i.menuItemId);
    const dbItems = await menuRepository.findByIds(ids);
    const dbItemsMap = new Map<string, IMenuItem>();
    for (const item of dbItems) {
      dbItemsMap.set(item._id.toString(), item);
    }

    const resolvedItems = [];
    let subtotal = 0;

    for (const itemInput of itemsInput) {
      const dbItem = dbItemsMap.get(itemInput.menuItemId);
      if (!dbItem) {
        const err: any = new Error(`Menu item with ID "${itemInput.menuItemId}" does not exist.`);
        err.status = 400;
        throw err;
      }
      if (!dbItem.isAvailable) {
        const err: any = new Error(`Menu item "${dbItem.name}" is currently unavailable.`);
        err.status = 400;
        throw err;
      }

      const itemTotal = Number((dbItem.price * itemInput.quantity).toFixed(2));
      subtotal += itemTotal;

      resolvedItems.push({
        menuItemId: dbItem._id,
        name: dbItem.name,
        unitPrice: dbItem.price,
        quantity: itemInput.quantity,
        itemTotal,
      });
    }

    return {
      items: resolvedItems,
      subtotal: Number(subtotal.toFixed(2)),
    };
  }
}

export const menuService = new MenuService();
