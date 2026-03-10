/**
 * Balance Calculator Utility
 * Implements the 5-step greedy algorithm to calculate minimal transactions.
 */

interface UserBalance {
    userId: number;
    username: string;
    balance: number;
}

interface Transaction {
    from: { userId: number; username: string };
    to: { userId: number; username: string };
    amount: number;
}

export const calculateBalancesFromData = (expenses: any[], splits: any[], members: any[], settlements: any[] = []) => {
    const userBalances: Record<number, number> = {};
    const userIdToName: Record<number, string> = {};

    // Initialize balances for all group members
    members.forEach(m => {
        userBalances[m.id] = 0;
        userIdToName[m.id] = m.username;
    });

    // 1. amountPaid = sum of all expenses where payer_id = userId
    expenses.forEach(exp => {
        const payerId = exp.payer_id;
        if (userBalances[payerId] !== undefined) {
            userBalances[payerId] += parseFloat(exp.amount);
        }
    });

    // 2. amountOwed = sum of expense_splits where user_id = userId
    splits.forEach(split => {
        const debtorId = split.user_id;
        if (userBalances[debtorId] !== undefined) {
            userBalances[debtorId] -= parseFloat(split.share);
        }
    });

    // 3. Add settlements: 
    // sender_id = person who is paying (debtor paying back)
    // receiver_id = person who is receiving (creditor getting paid)
    settlements.forEach(s => {
        const senderId = s.sender_id;
        const receiverId = s.receiver_id;
        const amount = parseFloat(s.amount);

        // Sender pays out, so their "debt" decreases (balance increases)
        if (userBalances[senderId] !== undefined) {
            userBalances[senderId] += amount;
        }
        // Receiver gets money, so their "credit" decreases (balance decreases)
        // Wait, balance = paid - owed. 
        // If I receive money, my 'paid' advantage decreases because I'm being reimbursed.
        if (userBalances[receiverId] !== undefined) {
            userBalances[receiverId] -= amount;
        }
    });

    // 4. Partition users into creditors (balance > 0) and debtors (balance < 0)
    const creditors: UserBalance[] = [];
    const debtors: UserBalance[] = [];

    Object.keys(userBalances).forEach(uidStr => {
        const uid = parseInt(uidStr);
        const bal = Math.round(userBalances[uid] * 100) / 100;
        if (bal > 0) {
            creditors.push({ userId: uid, username: userIdToName[uid], balance: bal });
        } else if (bal < 0) {
            debtors.push({ userId: uid, username: userIdToName[uid], balance: bal });
        }
    });

    // 4. Greedy loop: take the largest debtor and largest creditor
    // Sort creditors descending, debtors ascending (most negative first)
    creditors.sort((a, b) => b.balance - a.balance);
    debtors.sort((a, b) => a.balance - b.balance);

    const transactions: Transaction[] = [];
    let cIdx = 0;
    let dIdx = 0;

    while (cIdx < creditors.length && dIdx < debtors.length) {
        const creditor = creditors[cIdx];
        const debtor = debtors[dIdx];

        const amountToTransfer = Math.min(creditor.balance, Math.abs(debtor.balance));
        const roundedAmount = Math.round(amountToTransfer * 100) / 100;

        if (roundedAmount > 0) {
            transactions.push({
                from: { userId: debtor.userId, username: debtor.username },
                to: { userId: creditor.userId, username: creditor.username },
                amount: roundedAmount
            });
        }

        creditor.balance -= roundedAmount;
        debtor.balance += roundedAmount;

        if (Math.abs(creditor.balance) < 0.01) cIdx++;
        if (Math.abs(debtor.balance) < 0.01) dIdx++;
    }

    return transactions;
};
