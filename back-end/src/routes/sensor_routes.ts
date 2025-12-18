import { Router } from "express";
import { SensorControllers } from "../controllers/sensor_controller";
import { authMiddleware } from "../middleware/auth";
const router = Router();

router.get('/limit', authMiddleware, SensorControllers.getLimit);
router.get('/all', authMiddleware, SensorControllers.getAll);
router.get('/latest', authMiddleware, SensorControllers.getLatest);

export default router;