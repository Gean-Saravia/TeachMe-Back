import { Router } from "express";
import {
    access,
    getToken,
    getUsers,
    register,
} from "../controllers/users.controllers.js";
import { verifyTemporaryHash } from '../verifica-hash.js'; // Importa el controlador para verificar el hash

const router = Router();

router.get("/", getUsers);
router.get("/token", getToken);

// Registro de usuario
router.post("/sign-up", register);

router.post("/sign-in", access);

// Nueva ruta para verificar el hash de confirmación
router.get("/confirm/:hash", verifyTemporaryHash);

export default router;