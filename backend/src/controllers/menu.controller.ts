import { Request, Response, NextFunction } from 'express';
import { menuService } from '../services/menu.service.js';

export class MenuController {
  async getMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const availableOnly = req.query.availableOnly === 'true';
      const items = await menuService.getMenu(availableOnly);
      res.json({
        success: true,
        data: items,
      });
    } catch (err) {
      next(err);
    }
  }

  async getMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const item = await menuService.getMenuItem(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          error: `Menu item with ID "${id}" was not found.`,
        });
      }
      res.json({
        success: true,
        data: item,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const menuController = new MenuController();
