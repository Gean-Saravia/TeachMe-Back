import { Router } from "express";
import {
    getCourses
} from "../controllers/courses.controllers.js";

const router = Router();

router.get("/", getCourses);

/*
router.get("/products/count", getTotalProducts);

router.get("/products/:id", getProductById);

router.delete("/products/:id", deleteProductById);

router.put("/products/:id", updateProductById);
*/
export default router;