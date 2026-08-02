import express from "express";
import { auth } from "../middleware/auth";
import { admin } from "../middleware/admin";
import { createProduct, deleteProduct, getProduct, listProducts, updateProduct } from "../controllers/productController";

export const productRouter = express.Router();

productRouter.get("/products", listProducts);
productRouter.get("/products/:id", getProduct);
productRouter.post("/products", auth, admin, createProduct);
productRouter.put("/products/:id", auth, admin, updateProduct);
productRouter.delete("/products/:id", auth, admin, deleteProduct);
