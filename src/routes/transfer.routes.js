import { Router } from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import { transfer } from "../controllers/TransferController.js"

const router = Router()

router.post("/transfer", authMiddleware, transfer)

export default router