import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './routes/authRoutes.ts';
import groupRoutes from './routes/groupRoutes.ts';
import expenseRoutes from './routes/expenseRoutes.ts';
import settlementRoutes from './routes/settlementRoutes.ts';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Server is healthy' });
});

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settlements', settlementRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});