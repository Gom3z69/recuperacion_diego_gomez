import express from "express";
import registerUserController from "../controller/registerUserController.js";
import upload from "../../utils/multer.js";

const router = express.Router();

router.route("/").post(upload.single("fotoPerfil"), registerUserController.register);
router.route("/verifyCode").post(registerUserController.verifyCode);

export default router;