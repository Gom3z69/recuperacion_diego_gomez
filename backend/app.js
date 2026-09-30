import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import multer from "multer";
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

app.use((req, res) => {
    res.status(404).json({message: "Ruta no encontrada "});
});

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        const multerMessages = {
            LIMIT_FILE_SIZE: "La fotografía no debe superar los 5 MB",
            LIMIT_UNEXPECTED_FILE: "La fotografía debe enviarse en el campo fotoPerfil"
        };
        return res.status(400).json({message: multerMessages[error.code] || error.message});
    }

    if (error.type === "entity.parse.failed") {
        return res.status(400).json({message: "El JSON enviado no es válido"});
    }

    console.log("error " + error);
    res.status(500).json({message: "Error interno del servidor"});
});

export default app;