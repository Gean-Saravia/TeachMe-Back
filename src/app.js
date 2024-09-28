import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import userRoutes from './routes/users.routes.js';
import coursesRoutes from './routes/courses.routes.js';
import classesRoutes from './routes/classes.routes.js'; 
import hiringsRoutes from './routes/hirings.routes.js'
import reviewsRoutes from './routes/review.routes.js'

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser())

// Routes
app.use("/api/users", userRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/hirings", hiringsRoutes)
app.use("/api/reviews", reviewsRoutes)

export default app;
