import Sweet from "../models/Sweet";
import { isDBConnected } from "../config/db";

export const getSweets = async (_: any, res: any) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ 
        message: "Database is not available. Please ensure MongoDB is running." 
      });
    }
    const sweets = await Sweet.find();
    res.json(sweets);
  } catch (error: any) {
    if (error.name === 'MongoServerError' || error.message?.includes('buffering')) {
      return res.status(503).json({ 
        message: "Database connection error. Please ensure MongoDB is running." 
      });
    }
    res.status(500).json({ message: error.message || "Failed to fetch sweets" });
  }
};

export const addSweet = async (req: any, res: any) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ 
        message: "Database is not available. Please ensure MongoDB is running." 
      });
    }

    const { name, category, price, quantity, image } = req.body;
    let imageUrl = image || "";

    // If file was uploaded, use the file path
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    if (!name || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const sweet = await Sweet.create({ name, category, price, quantity, image: imageUrl });
    res.status(201).json(sweet);
  } catch (error: any) {
    if (error.name === 'MongoServerError' || error.message?.includes('buffering')) {
      return res.status(503).json({ 
        message: "Database connection error. Please ensure MongoDB is running." 
      });
    }
    res.status(500).json({ message: error.message || "Failed to create sweet" });
  }
};

export const updateSweet = async (req: any, res: any) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ 
        message: "Database is not available. Please ensure MongoDB is running." 
      });
    }

    const updateData: any = { ...req.body };
    
    // If file was uploaded, use the file path
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const sweet = await Sweet.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!sweet) {
      return res.status(404).json({ message: "Sweet not found" });
    }
    res.json(sweet);
  } catch (error: any) {
    if (error.name === 'MongoServerError' || error.message?.includes('buffering')) {
      return res.status(503).json({ 
        message: "Database connection error. Please ensure MongoDB is running." 
      });
    }
    res.status(500).json({ message: error.message || "Failed to update sweet" });
  }
};

export const deleteSweet = async (req: any, res: any) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ 
        message: "Database is not available. Please ensure MongoDB is running." 
      });
    }

    const sweet = await Sweet.findByIdAndDelete(req.params.id);
    if (!sweet) {
      return res.status(404).json({ message: "Sweet not found" });
    }
    res.json({ message: "Deleted" });
  } catch (error: any) {
    if (error.name === 'MongoServerError' || error.message?.includes('buffering')) {
      return res.status(503).json({ 
        message: "Database connection error. Please ensure MongoDB is running." 
      });
    }
    res.status(500).json({ message: error.message || "Failed to delete sweet" });
  }
};

export const purchaseSweet = async (req: any, res: any) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ 
        message: "Database is not available. Please ensure MongoDB is running." 
      });
    }

    const { quantity = 1 } = req.body;
    const sweet = await Sweet.findById(req.params.id);

    if (!sweet) {
      return res.status(404).json({ message: "Sweet not found" });
    }

    if (sweet.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    if (sweet.quantity <= 0) {
      return res.status(400).json({ message: "Out of stock" });
    }

    sweet.quantity -= quantity;
    await sweet.save();
    res.json(sweet);
  } catch (error: any) {
    if (error.name === 'MongoServerError' || error.message?.includes('buffering')) {
      return res.status(503).json({ 
        message: "Database connection error. Please ensure MongoDB is running." 
      });
    }
    res.status(500).json({ message: error.message || "Purchase failed" });
  }
};

export const restockSweet = async (req: any, res: any) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ 
        message: "Database is not available. Please ensure MongoDB is running." 
      });
    }

    const { quantity } = req.body;
    const sweet = await Sweet.findById(req.params.id);

    if (!sweet) {
      return res.status(404).json({ message: "Sweet not found" });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Valid quantity is required" });
    }

    sweet.quantity += quantity;
    await sweet.save();
    res.json(sweet);
  } catch (error: any) {
    if (error.name === 'MongoServerError' || error.message?.includes('buffering')) {
      return res.status(503).json({ 
        message: "Database connection error. Please ensure MongoDB is running." 
      });
    }
    res.status(500).json({ message: error.message || "Restock failed" });
  }
};
