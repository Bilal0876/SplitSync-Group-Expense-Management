import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.ts';
import { validateFields } from '../middleware/validateMiddleware.ts';
import {
     createGroup,
     getGroupsByUser,
     getGroupById,
     addMember,
     removeMember,
} from '../controllers/groupController.ts';
import {
     getExpensesByGroup,
     createExpense,
} from '../controllers/expenseController.ts';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// POST /api/groups — Create a new group
router.post('/', validateFields(['name']), createGroup);

// GET /api/groups — Get all groups for the authenticated user
router.get('/', getGroupsByUser);

// GET /api/groups/:groupId — Get a single group by ID (member check in controller)
router.get('/:groupId', getGroupById);

// POST /api/groups/:groupId/members — Add a member to a group
router.post('/:groupId/members', validateFields(['email']), addMember);

// DELETE /api/groups/:groupId/members — Remove a member from a group
router.delete('/:groupId/members', validateFields(['userId']), removeMember);

// GET /api/groups/:groupId/expenses — Get all expenses for a group
router.get('/:groupId/expenses', getExpensesByGroup);

// POST /api/groups/:groupId/expenses — Create a new expense in a group
router.post('/:groupId/expenses', validateFields(['title', 'amount']), createExpense);

export default router;

