import {Router} from 'express';
import { registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { loginUser, logoutUser } from '../controllers/user.controller.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";



const router = Router();


router.route("/register").post(
    upload.fields([
        {
          name : "avatar",
          maxCount : 1  
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    (req, res, next) => {
        console.log("Received Files:", req.files);
        console.log("Received Body:", req.body);
        next(); // Pass to `registerUser`
    },
    registerUser
);

router.route("/login").post(loginUser)
//secure route
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router;  