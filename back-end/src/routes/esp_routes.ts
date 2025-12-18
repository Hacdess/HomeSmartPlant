import { Router } from "express";
import { EspControllers } from "../controllers/esp_controllers";
import { authMiddleware } from "../middleware/auth";
const router = Router();

router.post('/bind', authMiddleware, EspControllers.bind);

export default router;