import { Router } from 'express';
import * as SettlementController from '../controllers/settlementController';
import { authenticateToken } from '../middleware/authMiddleware.ts';

const router = Router();

router.use(authenticateToken);

// GET /api/settlements/:groupId/balances
router.get('/:groupId/balances', SettlementController.getBalances);

// POST /api/settlements/:groupId/record
router.post('/:groupId/record', SettlementController.recordSettlement);

export default router;
