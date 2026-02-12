import { Router } from "express"
import authRoutes from "./auth.routes.js"
import transferRoutes from "./transfer.routes.js"

const router = Router()

router.use(authRoutes)
router.use(transferRoutes)

export default router