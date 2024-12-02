import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import bodyParser from "body-parser";

/* ROUTE IMPORTS */
import projectRoutes from "./src/routes/projectRoutes";
import taskRoutes from "./src/routes/taskRoutes";
import userRoutes from "./src/routes/userRoutes";
import searchRoutes from "./src/routes/searchRoutes";

/* CONFIGURATIONS */
dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));

// Helmet Configuration
app.use(helmet());
app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin",
  })
);

// CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://pm-manage.vercel.app",
      "https://project-manage-iota.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// Home Route
app.get("/", (req: Request, res: Response) => {
  res.send("This is the home route.");
});

// API Routes
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/users", userRoutes);
app.use("/search", searchRoutes);

// Swagger Configuration
// const swaggerOptions = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Project Management API",
//       version: "1.0.0",
//       description: "API for managing projects, tasks, and users.",
//     },
//     servers: [
//       {
//         url: "http://localhost:5000",
//         description: "Development server",
//       },
//       {
//         url: "https://pm-manage.vercel.app",
//         description: "Production server",
//       },
//     ],
//   },
//   apis: ["./src/routes/*.ts"],
// };
// const swaggerDocs = swaggerJsDoc(swaggerOptions);
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Server Initialization
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in mode on port ${PORT}`);
});
