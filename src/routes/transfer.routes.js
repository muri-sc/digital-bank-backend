import { Router } from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js"

const router = Router()

router.post("/transfer", authMiddleware, (req, res) => {
    res.json({
        message: "Accepted",
        userId: req.userId
    })
})

export default router