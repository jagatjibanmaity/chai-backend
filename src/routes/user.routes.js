import {Router} from 'express';
import { registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';



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

export default router;  