import express from "express";
import registerUserController from "./registerUsers";

const router = express.Router();

router.route("/").post(registerUsersController.register);
router.route("/verifyCode").post(registerUsersController.verifyCode);

export default router;