import { Router } from 'express'
import { logOutUser, loginUser, registerUser } from '../controllers/user.controllers.js'
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

router.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxcount: 1
    },
    {
        name: "coverImage",
        maxcount: 1
    }
]), registerUser)

router.route("/login").post(loginUser)

// Secured Routes
router.route("/logout").post(verifyJWT, logOutUser)

export default router