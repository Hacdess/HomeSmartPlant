import { Router } from "express";
import { MailControllers } from "../controllers/mail_controller";
import { authMiddleware } from "../middleware/auth";
const router = Router();

router.post('/send', authMiddleware, MailControllers.send);

export default router;