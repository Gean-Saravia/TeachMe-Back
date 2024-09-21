import express from "express";
import cors from "cors";
import morgan from "morgan";

import userRoutes from './routes/users.routes.js'
import coursesRoutes from './routes/courses.routes.js'

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/courses", coursesRoutes);

export default app;