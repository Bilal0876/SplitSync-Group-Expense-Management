import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.ts';
import * as GroupModel from '../models/groupModel.ts';
import { findByemail } from '../models/userModel.ts';

export const createGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const userId = req.user!.id;
    const group = await GroupModel.createGroup(name, userId);
    res.status(201).json(group);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getGroupsByUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const groups = await GroupModel.getGroupsByUser(userId);
    res.json(groups);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getGroupById = async (req: AuthRequest, res: Response) => {
  try {
    const groupId = parseInt(req.params.groupId as string);
    const userId = req.user!.id;

    const authorized = await GroupModel.isMember(groupId, userId);
    if (!authorized) {
      return res.status(403).json({ error: "Access denied: You are not a member of this group." });
    }

    const group = await GroupModel.getGroupById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    res.json(group);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addMember = async (req: AuthRequest, res: Response) => {
  try {
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

    await GroupModel.addMember(groupId, user.id);
    res.status(200).json({
      message: "Member added successfully",
      member: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const groupId = parseInt(req.params.groupId as string);
    const { userId } = req.body;

    const authorized = await GroupModel.isMember(groupId, req.user!.id);
    if (!authorized) {
      return res.status(403).json({ error: "Access denied: You are not a member of this group." });
    }

    await GroupModel.removeMember(groupId, userId);
    res.status(200).json({ message: "Member removed successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
