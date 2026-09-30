import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoutes from "./src/routes/users.js";
import registerRoutes from "./src/routes/registerUsers.js";

const app = express();

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.json({message: "API FUNCIONANDO CORRECTAMENTE"});
});

app.use("/api/register", registerRoutes);
app.use("/api/users", userRoutes);