import { Router } from 'express';
import * as ExpenseController from '../controllers/expenseController';
import { authenticateToken } from '../middleware/authMiddleware.ts';
import { validateFields } from '../middleware/validateMiddleware.ts';


const router = Router();

router.use(authenticateToken);

// CREATE
router.post('/', [

     validateFields(['groupId', 'payerId', 'description', 'amount'])
], ExpenseController.createExpense);

// READ (Group View)
router.get('/group/:groupId', [
     validateFields(['groupId'])
], ExpenseController.getExpensesByGroup);

// UPDATE
router.put('/:id', [

     validateFields(['description', 'amount'])
], ExpenseController.updateExpense);

// DELETE
router.delete('/:id', ExpenseController.deleteExpense);

export default router;
