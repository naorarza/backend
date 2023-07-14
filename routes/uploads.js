const express= require("express");
const path = require("path");
const fs = require('fs');
const router = express.Router();


router.get("/" , (req, res) => {
  res.json({msg:"u are in uploads"});
})

// העלאת קובץ
router.post("/", async(req,res) => {
  // req.Files -> מכיל את הקבצים שנשלח אליו
  // myFile -> השם של קיי שמכיל את הקובץ
  try{
    console.log(req.files.myFile);
    let myFile = req.files.myFile;
    // בודק שהקובץ לא שוקל מעל 5 מב
    if(myFile.size >= 1024*1024*5){
      return res.status(400).json({err:"File too big (max 5mb)"})
    }
    // סיומות שמרשה לעלות של תמונות
    let exts_ar = [".png",".jpg",".jpeg"];
    if(!exts_ar.includes(path.extname(myFile.name))){
      return res.status(400).json({err:"File not allowed, just "+ exts_ar.toString()})
    }
    // .mv -> פונקציה שמעלה את הקובץ לכתובת של הרפמטר הראשון
    // בפרמטר השני מפעיל קולבק שמקבל פרמטר אירור אם יש
    myFile.mv("public/images/"+myFile.name, (err) => {
      if(err){ return res.status(400).json({err})}
      res.json({msg:"file upload"})
    })

  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

router.delete('/image/:imageName', function(req, res) {
  const imagePath = path.join(__dirname, '..', 'public', 'images', req.params.imageName);

  fs.unlink(imagePath, function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error deleting file' });
    }

    console.log('File deleted!');
    res.json({ message: 'File deleted successfully' });
  });
});

module.exports = router;