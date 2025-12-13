import mongoose from "mongoose";

const SweetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  image: { type: String, default: "" } // Image URL or path
});

export default mongoose.model("Sweet", SweetSchema);
