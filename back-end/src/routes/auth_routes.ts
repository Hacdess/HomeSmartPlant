import { Router } from "express";
import { AuthControllers } from "../controllers/auth_controllers";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post('/signup', AuthControllers.signUp);
router.post('/signin', AuthControllers.signIn);
router.post('/signout', authMiddleware, AuthControllers.signOut);
router.get('/profile', authMiddleware, AuthControllers.getUser);

export default router;