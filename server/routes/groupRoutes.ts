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

router.use(authenticateToken);

// /api/groups - to create a new group
router.post(
    '/',
    [body('name').notEmpty().withMessage('Group name is required').trim()],
    handleValidationErrors,
    createGroup
);

// /api/groups — to get all groups for the user
router.get('/', getGroupsByUser);

// /api/groups/:groupId — to Get a single group by ID
router.get(
    '/:groupId',
    [param('groupId').isInt().withMessage('Valid Group ID is required')],
    handleValidationErrors,
    getGroupById
);

//  /api/groups/:groupId/members — to add a member to a group
router.post(
    '/:groupId/members',
    [
        param('groupId').isInt(),
        body('email').isEmail().withMessage('Valid email is required').normalizeEmail({ gmail_remove_dots: false })
    ],
    handleValidationErrors,
    addMember
);

//  /api/groups/:groupId/members — to remove a member from a group
router.delete(
    '/:groupId/members',
    [
        param('groupId').isInt(),
        body('userId').isInt().withMessage('Valid User ID is required')
    ],
    handleValidationErrors,
    removeMember
);

// /api/groups/:groupId/leave — for a user to leave the group
router.delete(
    '/:groupId/leave',
    [param('groupId').isInt()],
    handleValidationErrors,
    leaveGroup
);

// /api/groups/:groupId/expenses — to get all expenses for a group
router.get(
    '/:groupId/expenses',
    [param('groupId').isInt()],
    handleValidationErrors,
    getExpensesByGroup
);

// /api/groups/:groupId/expenses — to add a new expense in a group
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

