import prisma from '../config/prisma.ts';

export interface Group {
  id: number;
  name: string;
  created_at: Date;
  created_by: number | null;
}

export const createGroup = async (name: string, userId: number) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Insert into groups
    const newGroup = await tx.groups.create({
      data: { 
        name: name,
        created_by: userId
      } as any
    });

    // 2. Insert creator into group_members
    await tx.group_members.create({
      data: {
        group_id: newGroup.id,
        user_id: userId
      }
    });

    return newGroup;
  });
};


export const getGroupsByUser = async (userId: number) => {
  const userGroups = await prisma.groups.findMany({
    where: {
      group_members: {
        some: { user_id: userId }
      }
    },
    include: {
      _count: {
        select: { group_members: true }
      }
    }
  });

  return userGroups.map(g => ({
    ...g,
    member_count: g._count.group_members
  }));
};


export const getGroupById = async (groupId: number) => {
  const group = await prisma.groups.findUnique({
    where: { id: groupId },
    include: {
      group_members: {
        include: {
          users: {
            select: { id: true, username: true, email: true }
          }
        }
      }
    }
  });

  if (!group) return null;

  const g = group as any;

  // Remap to match previous raw SQL results (members as an array of user objects)
  return {
    id: g.id,
    name: g.name,
    created_at: g.created_at,
    created_by: g.created_by,
    members: g.group_members.map((gm: any) => gm.users)
  };
};


export const addMember = async (groupId: number, userId: number) => {
  await prisma.group_members.upsert({
    where: {
      group_id_user_id: {
        group_id: groupId,
        user_id: userId
      }
    },
    update: {}, // DO NOTHING
    create: {
      group_id: groupId,
      user_id: userId
    }
  });
};


export const removeMember = async (groupId: number, userId: number) => {
  return await prisma.$transaction(async (tx) => {
    const memberCount = await tx.group_members.count({
      where: { group_id: groupId }
    });

    if (memberCount <= 1) {
      throw new Error("Cannot remove member: they are the last member.");
    }

    const deleteRes = await tx.group_members.deleteMany({
      where: {
        group_id: groupId,
        user_id: userId
      }
    });

    if (deleteRes.count === 0) {
      throw new Error("Cannot remove member: user is not in group.");
    }
  });
};


export const leaveGroup = async (groupId: number, userId: number) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Remove the user from the group
    const deleteRes = await tx.group_members.deleteMany({
      where: {
        group_id: groupId,
        user_id: userId
      }
    });

    if (deleteRes.count === 0) {
      throw new Error("User is not a member of this group.");
    }

    // 2. Check if any members remain
    const memberCount = await tx.group_members.count({
      where: { group_id: groupId }
    });

    // 3. If no members left, delete the group
    if (memberCount === 0) {
      await tx.groups.delete({
        where: { id: groupId }
      });
    }

    return { groupDeleted: memberCount === 0 };
  });
};


export const isMember = async (groupId: number, userId: number): Promise<boolean> => {
  const count = await prisma.group_members.count({
    where: {
      group_id: groupId,
      user_id: userId
    }
  });
  return count > 0;
};



