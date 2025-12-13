import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { env } from "../config/env";
import { isDBConnected } from "../config/db";

export const register = async (req: any, res: any) => {
  try {
    // Check if database is connected
    if (!isDBConnected()) {
      return res.status(503).json({ 
        message: "Database is not available. Please ensure MongoDB is running." 
      });
    }

    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Return user without password
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.status(201).json({ token, user: userResponse });
  } catch (error: any) {
    if (error.name === 'MongoServerError' || error.message?.includes('buffering')) {
      return res.status(503).json({ 
        message: "Database connection error. Please ensure MongoDB is running." 
      });
    }
    res.status(500).json({ message: error.message || "Registration failed" });
  }
};

export const login = async (req: any, res: any) => {
  try {
    // Check if database is connected
    if (!isDBConnected()) {
      return res.status(503).json({ 
        message: "Database is not available. Please ensure MongoDB is running." 
      });
    }

    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Return user without password
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.json({ token, user: userResponse });
  } catch (error: any) {
    if (error.name === 'MongoServerError' || error.message?.includes('buffering')) {
      return res.status(503).json({ 
        message: "Database connection error. Please ensure MongoDB is running." 
      });
    }
    res.status(500).json({ message: error.message || "Login failed" });
  }
};
