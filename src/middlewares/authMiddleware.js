import jwt from "jsonwebtoken"

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).json({ error: "Token not provided" })
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ error: "Invalid token" })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.userId = decoded.userId

        return next()
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token" })
    }
}