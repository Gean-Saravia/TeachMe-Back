import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { APP_URL } from "./config.js";

import userRoutes from './routes/users.routes.js'
import coursesRoutes from './routes/courses.routes.js'

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser())

// Routes
app.use("/api/users", userRoutes);
app.use("/api/courses", coursesRoutes);

export default app;