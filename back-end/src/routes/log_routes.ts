import { Router } from "express";
import { LogControllers } from "../controllers/log_controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get('/all', authMiddleware, LogControllers.getAll);
router.post('/', authMiddleware, LogControllers.write)

export default router;