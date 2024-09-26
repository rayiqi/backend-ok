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
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
app.get("/", (req, res) => {
  res.send("This is home route");
});

app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/search", searchRoutes);
app.use("/users", userRoutes);
app.use("/teams", teamRoutes);
app.use("/projects-teams", projectTeamRoutes);

// Konfigurasi Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Project API Documentation",
      version: "1.0.0",
      description: "API documentation for Project Task Manager",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`, // Sesuaikan dengan URL API kamu
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Tentukan di mana file route yang berisi komentar Swagger
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
/* SERVER */
const port = Number(process.env.PORT) || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on part ${port}`);
});
