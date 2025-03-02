import multer from "multer";

/*const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, Date.now() + "-" + file.originalname)

    }
  })
  
export const upload = multer({ 
    storage
})*/

import fs from "fs";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = "./public/temp";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
