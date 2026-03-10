import db from '../config/db.ts';

export const recordSettlement = async (groupId: number, senderId: number, receiverId: number, amount: number) => {
    const query = `
        INSERT INTO settlements (group_id, sender_id, receiver_id, amount)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const values = [groupId, senderId, receiverId, amount];
    const res = await db.query(query, values);
    return res.rows[0];
};

export const getSettlements = async (groupId: number) => {
    const query = `
        SELECT s.*, 
               u1.username AS sender_name, 
               u2.username AS receiver_name
        FROM settlements s
        JOIN users u1 ON s.sender_id = u1.id
        JOIN users u2 ON s.receiver_id = u2.id
        WHERE s.group_id = $1
        ORDER BY s.settled_at DESC;
    `;
    const res = await db.query(query, [groupId]);
    return res.rows;
};
