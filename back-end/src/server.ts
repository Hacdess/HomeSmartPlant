import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth_routes';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Để đọc được body json
app.use(cookieParser());

// Setup Router API
// Tất cả api auth sẽ bắt đầu bằng /api/auth
// Ví dụ: http://localhost:3000/api/auth/login
app.use('/api/auth', authRoutes);

// Route mặc định check server
app.get('/', (req, res) => {
  res.send('Supabase Auth API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});