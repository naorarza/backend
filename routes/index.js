const express= require("express");
const router = express.Router();

router.get("/", async(req,res) => {
  res.json({msg:"Cyclic Work 200"});
})


module.exports = router;