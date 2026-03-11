import db from '../config/db.ts';

export interface Group {
  id: number;
  name: string;
  created_at: Date;
}

export const createGroup = async (name: string, userId: number): Promise<Group> => {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insert into groups
    const groupQuery = `INSERT INTO groups (name) VALUES ($1) RETURNING *`;
    const groupRes = await client.query(groupQuery, [name]);
    const newGroup: Group = groupRes.rows[0];

    // 2. Insert creator into group_members
    const memberQuery = `INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)`;
    await client.query(memberQuery, [newGroup.id, userId]);

    await client.query('COMMIT');
    return newGroup;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // Always release the client back to the pool
    client.release();
  }
};


export const getGroupsByUser = async (userId: number) => {
  const query = `
    SELECT g.*, COUNT(gm_all.user_id)::int as member_count
    FROM groups g
    JOIN group_members gm_user ON g.id = gm_user.group_id
    JOIN group_members gm_all ON g.id = gm_all.group_id
    WHERE gm_user.user_id = $1
    GROUP BY g.id;
  `;
  const res = await db.query(query, [userId]);
  return res.rows;
};


export const getGroupById = async (groupId: number) => {
  const query = `
    SELECT 
      g.id, g.name, g.created_at,
      json_agg(json_build_object('id', u.id, 'username', u.username, 'email', u.email)) as members
    FROM groups g
    JOIN group_members gm ON g.id = gm.group_id
    JOIN users u ON gm.user_id = u.id
    WHERE g.id = $1
    GROUP BY g.id;
  `;
  const res = await db.query(query, [groupId]);
  return res.rows[0];
};


export const addMember = async (groupId: number, userId: number) => {
  const query = `
    INSERT INTO group_members (group_id, user_id) 
    VALUES ($1, $2) 
    ON CONFLICT (group_id, user_id) DO NOTHING
  `;
  await db.query(query, [groupId, userId]);
};


export const removeMember = async (groupId: number, userId: number) => {
  const query = `
    DELETE FROM group_members 
    WHERE group_id = $1 AND user_id = $2
    AND (SELECT COUNT(*) FROM group_members WHERE group_id = $1) > 1
    RETURNING *;
  `;
  const res = await db.query(query, [groupId, userId]);
  if (res.rowCount === 0) {
    throw new Error("Cannot remove member: either user is not in group or they are the last member.");
  }
};


export const leaveGroup = async (groupId: number, userId: number) => {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Remove the user from the group
    const removeMemberQuery = `DELETE FROM group_members WHERE group_id = $1 AND user_id = $2 RETURNING *`;
    const removeRes = await client.query(removeMemberQuery, [groupId, userId]);

    if (removeRes.rowCount === 0) {
      throw new Error("User is not a member of this group.");
    }

    // 2. Check if any members remain
    const countQuery = `SELECT COUNT(*) FROM group_members WHERE group_id = $1`;
    const countRes = await client.query(countQuery, [groupId]);
    const memberCount = parseInt(countRes.rows[0].count);

    // 3. If no members left, delete the group (cascades or manual delete of other related data)
    // Assuming we might have foreign keys with ON DELETE CASCADE for expenses/settlements
    if (memberCount === 0) {
      const deleteGroupQuery = `DELETE FROM groups WHERE id = $1`;
      await client.query(deleteGroupQuery, [groupId]);
    }

    await client.query('COMMIT');
    return { groupDeleted: memberCount === 0 };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};


export const isMember = async (groupId: number, userId: number): Promise<boolean> => {
  const query = `SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2`;
  const res = await db.query(query, [groupId, userId]);
  return (res.rowCount ?? 0) > 0;
};



