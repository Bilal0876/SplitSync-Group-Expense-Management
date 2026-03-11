import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.ts';
import { handleValidationErrors } from '../middleware/validateMiddleware.ts';
import { body, param } from 'express-validator';
import {
     createGroup,
     getGroupsByUser,
     getGroupById,
     addMember,
     removeMember,
     leaveGroup,
} from '../controllers/groupController.ts';
import {
     getExpensesByGroup,
     createExpense,
} from '../controllers/expenseController.ts';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// POST /api/groups — Create a new group
router.post(
    '/', 
    [body('name').notEmpty().withMessage('Group name is required').trim()],
    handleValidationErrors,
    createGroup
);

// GET /api/groups — Get all groups for the authenticated user
router.get('/', getGroupsByUser);

// GET /api/groups/:groupId — Get a single group by ID
router.get(
    '/:groupId', 
    [param('groupId').isInt().withMessage('Valid Group ID is required')],
    handleValidationErrors,
    getGroupById
);

// POST /api/groups/:groupId/members — Add a member to a group
router.post(
    '/:groupId/members', 
    [
        param('groupId').isInt(),
        body('email').isEmail().withMessage('Valid email is required').normalizeEmail()
    ],
    handleValidationErrors,
    addMember
);

// DELETE /api/groups/:groupId/members — Remove a member from a group
router.delete(
    '/:groupId/members', 
    [
        param('groupId').isInt(),
        body('userId').isInt().withMessage('Valid User ID is required')
    ],
    handleValidationErrors,
    removeMember
);

// DELETE /api/groups/:groupId/leave — Current user leaves the group
router.delete(
    '/:groupId/leave',
    [param('groupId').isInt()],
    handleValidationErrors,
    leaveGroup
);

// GET /api/groups/:groupId/expenses — Get all expenses for a group
router.get(
    '/:groupId/expenses', 
    [param('groupId').isInt()],
    handleValidationErrors,
    getExpensesByGroup
);

// POST /api/groups/:groupId/expenses — Create a new expense in a group
router.post(
    '/:groupId/expenses', 
    [
        param('groupId').isInt(),
        body('title').notEmpty().withMessage('Description/Title is required').trim(),
        body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0')
    ],
    handleValidationErrors,
    createExpense
);

export default router;

