import express from "express";
import { auth } from "../middleware/auth";
import { admin } from "../middleware/admin";
import { deleteUser, getUserById, listUsers, updateUser } from "../controllers/userController";

export const userRouter = express.Router();

userRouter.get("/users", auth, admin, listUsers);
userRouter.get("/users/:id", auth, getUserById);
userRouter.put("/users/:id", auth, updateUser);
userRouter.delete("/users/:id", auth, admin, deleteUser);
