import pool from "../database/database.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const register = async (req, res) => {
    const { name, email, password } = req.body

    try {
        const hashedPassword = await bcrypt.hash(password, 10)

        const result = await pool.query(
            `
            INSERT INTO users (name, email, password)
            VALUES ($1, $2, $3)
            RETURNING id, name, email, balance
            `,
            [name, email, hashedPassword]
        )

        res.status(201).json(result.rows[0])
    } catch (err) {
        res.status(400).json({ error: "Error creating user", details: err.message })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body

    try {
        const result = await pool.query(
            `
            SELECT * FROM users WHERE email = $1
            `,
            [email]
        )

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "User not found" })
        }

        const user = result.rows[0]
        const validPassword = await bcrypt.compare(password, user.password)

        if (!validPassword) {
            return res.status(401).json({ error: "Invalid password" })
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.json({ token })
    } catch (err) {
        res.status(500).json({ error: "Error on login" })
    }
}