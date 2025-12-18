import { Router } from "express";
import { OutDeviceControllers } from "../controllers/outdevice_controller";
import { authMiddleware } from "../middleware/auth";
const router = Router();

router.get('/get', authMiddleware, OutDeviceControllers.get);
router.get('/pump', authMiddleware, OutDeviceControllers.getPump);
router.get('/light', authMiddleware, OutDeviceControllers.getLight);

export default router;