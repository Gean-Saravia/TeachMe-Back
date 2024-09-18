import { Router } from "express";
import {
    access,
    getUsers,
    register,
} from "../controllers/users.controllers.js";

const router = Router();

router.get("/", getUsers);

router.post("/sign-up", register);

router.post("/sign-in", access);
/*
router.get("/products/count", getTotalProducts);

router.get("/products/:id", getProductById);

router.delete("/products/:id", deleteProductById);

router.put("/products/:id", updateProductById);
*/
export default router;