const express= require("express");
const { validateEvent, EventModel } = require("../models/eventModel");
const authAdmin = require("../middlewares/authAdmin");
const router = express.Router();

router.get('/' ,authAdmin ,async(req,res) => {
    try{
        let data = await EventModel.find({});
        res.json(data)
      }
      catch(err){
        console.log(err);
        res.status(502).json({err})
      }
})

router.post("/" , async(req,res) => {   

    let validateBody = validateEvent(req.body);
    if(validateBody.error){
        return res.status(400).json(validateBody.error.details);
    }
    try {
        let event = new EventModel(req.body);
        await event.save();
        res.json(event);
    }catch(err){
        console.log(err);
        res.status(502).json({err});
    }

})

router.delete("/:idDel", async (req, res) => {
    try {
      let idDel = req.params.idDel;
      let data = await EventModel.deleteOne({ _id: idDel });
      // deleteOne will delete one and not many
      // if the delete is successful we will recive
      // deleteCount:1
      res.json(data);
    } catch (err) {
      console.log(err);
      res.status(502).json({ err });
    }
  });

module.exports = router;