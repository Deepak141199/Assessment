const express = require('express');
const router = express.Router();
const multer = require('multer');


router.use(express.json());


//handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); 
  },
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), (req, res) => {
  // Access the uploaded file details 
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ message: 'File uploaded successfully' });
});

module.exports=router;
