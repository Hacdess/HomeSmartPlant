import { Router } from "express";
import { AuthControllers } from "../controllers/auth_controllers";

const router = Router();

router.post('/signup', AuthControllers.signUp);

export default router;