import { Router } from "express";
import { TelegramControllers } from "../controllers/telegram_controllers";
import { authMiddleware } from "../middleware/auth";
const router = Router();

router.post('/send', authMiddleware, TelegramControllers.send);

export default router;