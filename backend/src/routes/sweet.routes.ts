import { Router } from "express";
import {
  getSweets,
  addSweet,
  updateSweet,
  deleteSweet,
  purchaseSweet,
  restockSweet
} from "../controllers/sweet.controller";
import { authenticate } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/role.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();
router.get("/", authenticate, getSweets);
router.post("/", authenticate, isAdmin, upload.single("image"), addSweet);
router.put("/:id", authenticate, isAdmin, upload.single("image"), updateSweet);
router.delete("/:id", authenticate, isAdmin, deleteSweet);
router.post("/:id/purchase", authenticate, purchaseSweet);
router.post("/:id/restock", authenticate, isAdmin, restockSweet);

export default router;
