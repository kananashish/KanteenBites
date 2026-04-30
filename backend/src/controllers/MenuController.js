const MenuItem = require('../models/MenuItem');

class MenuController {
  /**
   * Get all menu items
   */
  static async getMenu(req, res) {
    try {
      const { category, available } = req.query;

      let query = {};
      if (category) query.category = category;
      if (available !== undefined) query.isAvailable = available === 'true';

      const items = await MenuItem.find(query).sort({ category: 1, name: 1 });

      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get menu item by ID
   */
  static async getMenuItem(req, res) {
    try {
      const item = await MenuItem.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      res.json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create new menu item (admin only)
   */
  static async createMenuItem(req, res) {
    try {
      const {
        name,
        description,
        category,
        price,
        prepTime,
        stock,
        tags,
      } = req.body;

      const item = new MenuItem({
        name,
        description,
        category,
        price,
        prepTime,
        stock,
        tags,
      });

      await item.save();
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update menu item
   */
  static async updateMenuItem(req, res) {
    try {
      const { isAvailable, stock, price } = req.body;

      const item = await MenuItem.findByIdAndUpdate(
        req.params.id,
        { isAvailable, stock, price },
        { new: true }
      );

      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      res.json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Toggle item availability
   */
  static async toggleAvailability(req, res) {
    try {
      const item = await MenuItem.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      item.isAvailable = !item.isAvailable;
      await item.save();

      res.json({ id: item._id, isAvailable: item.isAvailable });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get categories
   */
  static async getCategories(req, res) {
    try {
      const categories = await MenuItem.distinct('category');
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = MenuController;
