import pool from "../database/database.js"

export const transfer = async (req, res) => {
    const fromUserId = Number(req.userId)
    const { toUserId, amount } = req.body

    const toUserIdNumber = Number(toUserId)
    const amountNumber = Number(amount)

    if (!toUserIdNumber || !amountNumber) {
        return res.status(400).json({ error: "Missing data" })
    }

    if (fromUserId === toUserIdNumber) {
        return res.status(400).json({ error: "Cannot transfer to yourself" })
    }

    if (amountNumber <= 0) {
        return res.status(400).json({ error: "Invalid amount" })
    }

    const client = await pool.connect()

    try {
        await client.query("BEGIN")

        const toUserResult = await client.query(
            `
            SELECT id FROM users WHERE id = $1
            `,
            [toUserIdNumber]
        )

        if (toUserResult.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(404).json({ error: "Recipient not found" })
        }

        const fromUserBalance = await client.query(
            `
            SELECT balance FROM users WHERE id = $1 FOR UPDATE
            `,
            [fromUserId]
        )

        const currentBalance = parseFloat(fromUserBalance.rows[0].balance)

        if (currentBalance < amountNumber) {
            await client.query("ROLLBACK")
            return res.status(400).json({ error: "Insufficient funds" })
        }

        await client.query(
            `
            UPDATE users SET balance = balance - $1 WHERE id = $2
            `,
            [amountNumber, fromUserId]
        )

        await client.query(
            `
            UPDATE users SET balance = balance + $1 WHERE id = $2
            `,
            [amountNumber, toUserIdNumber]
        )

        await client.query(
            `
            INSERT INTO transfers (from_user, to_user, amount)
            VALUES ($1, $2, $3)
            `,
            [fromUserId, toUserIdNumber, amountNumber]
        )

        await client.query("COMMIT")

        res.json({ message: "Transfer successful" })

    } catch (err) {
        await client.query("ROLLBACK")
        res.status(500).json({ error: "Transfer failed" })
    } finally {
        client.release()
    }
}