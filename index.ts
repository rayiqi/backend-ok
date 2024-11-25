import express, { Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

/* ROUTE IMPORTS */
import projectRoutes from "./src/routes/projectRoutes";
import taskRoutes from "./src/routes/taskRoutes";
import searchRoutes from "./src/routes/searchRoutes";
import userRoutes from "./src/routes/userRoutes";
import teamRoutes from "./src/routes/teamRoutes";
import projectTeamRoutes from "./src/routes/projectTeamRoutes";

/* CONFIGURATIONS */
dotenv.config(); // Pastikan ini memuat file .env

const app = express();

// Middleware
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    origin: ["http://localhost:3000", "https://pm-manage.vercel.app"],
  })
);

// Routes
app.get("/", (req, res) => {
  res.send("This is home route");
});

app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/search", searchRoutes);
app.use("/users", userRoutes);
app.use("/teams", teamRoutes);
app.use("/projects-teams", projectTeamRoutes);

// Swagger Configuration (optional)
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "Express API for Project Management",
    },
  },
  apis: ["./src/routes/*.ts"], // Sesuaikan dengan path API Anda
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Server Setup
const port = process.env.PORT || 3000; // Railway menyediakan PORT melalui environment variable
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
