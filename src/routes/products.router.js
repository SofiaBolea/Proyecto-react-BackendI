import { Router } from "express";
import { productController } from "../controllers/product-controller.js";

const router = Router();

/* ============================================ */
/* --- VISTAS - Productos                      */
/* ============================================ */
router.get("/view", productController.renderAll);
router.post("/", productController.createAndRedirect);
router.get("/:pid", productController.renderById);

/* ============================================ */
/* --- API REST - Productos (JSON)             */
/* ============================================ */
router.get("/", productController.getAll);
router.delete("/:pid", productController.delete);
router.put("/:pid", productController.update);

export default router;
 