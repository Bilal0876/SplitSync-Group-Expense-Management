import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.ts';
import * as GroupModel from '../models/groupModel.ts';
import { findByemail } from '../models/userModel.ts';
import asyncHandler from '../utils/asyncHandler.ts';

export const createGroup = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name } = req.body;
    const userId = req.user!.id;
    const group = await GroupModel.createGroup(name, userId);
    res.status(201).json(group);
});

export const getGroupsByUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const groups = await GroupModel.getGroupsByUser(userId);
    res.status(200).json(groups);
});

export const getGroupById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const groupId = parseInt(req.params.groupId as string);
    const userId = req.user!.id;

    const authorized = await GroupModel.isMember(groupId, userId);
    if (!authorized) {
      return res.status(403).json({ error: "Access denied: You are not a member of this group." });
    }

    const group = await GroupModel.getGroupById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    res.status(200).json(group);
});

export const addMember = asyncHandler(async (req: AuthRequest, res: Response) => {
    const groupId = parseInt(req.params.groupId as string);
    const { email } = req.body;

    const authorized = await GroupModel.isMember(groupId, req.user!.id);
    if (!authorized) {
      return res.status(403).json({ error: "Access denied: You are not a member of this group." });
    }

    // Look up user by email
    const user = await findByemail(email);
    if (!user) {
      return res.status(404).json({ error: `User with email ${email} not found.` });
    }

    // Check if already a member
    const alreadyMember = await GroupModel.isMember(groupId, user.id);
    if (alreadyMember) {
      return res.status(400).json({ error: "User is already a member of this group." });
    }

    await GroupModel.addMember(groupId, user.id);
    res.status(200).json({
      message: "Member added successfully",
      member: { id: user.id, username: user.username, email: user.email },
    });
});

export const removeMember = asyncHandler(async (req: AuthRequest, res: Response) => {
    const groupId = parseInt(req.params.groupId as string);
    const { userId } = req.body;
    const currentUserId = req.user!.id;

    const group = await GroupModel.getGroupById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    // 1. Check if the current user is the group creator (Admin)
    if (group.created_by !== currentUserId) {
      return res.status(403).json({ error: "Only the group creator can remove other members." });
    }

    // 2. Prevent the admin from removing themselves via this endpoint 
    // (They should use leaveGroup instead, or be forced to stay if they are the only member)
    if (userId === currentUserId) {
        return res.status(400).json({ error: "You cannot remove yourself. Use 'Leave Group' instead." });
    }

    await GroupModel.removeMember(groupId, userId);
    res.status(200).json({ message: "Member removed successfully" });
});

export const leaveGroup = asyncHandler(async (req: AuthRequest, res: Response) => {
    const groupId = parseInt(req.params.groupId as string);
    const userId = req.user!.id;

    const result = await GroupModel.leaveGroup(groupId, userId);
    res.status(200).json({ 
        message: result.groupDeleted ? "Left group and group deleted as no members remained." : "Successfully left the group.",
        groupDeleted: result.groupDeleted
    });
});
