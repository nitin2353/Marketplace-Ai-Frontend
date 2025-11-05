import express from 'express'
import cloudinary from "../middleware/upload.js";
import upload from '../middleware/multer.js'
import userAuth from '../middleware/userAuth.js'
import gigModel from '../models/gigModel.js'
import mongoose, { Mongoose } from 'mongoose';


const gigsRouter = express.Router()

gigsRouter.post("/", userAuth, upload.single("gigImage"), async (req, res) => {
  try {
    const { title, description, category, budget, location } = req.body;
    console.log(title, description, category, budget, location);

    if (!title || !description || !category || !budget || !location) {
      return res.status(400).json({
        success: false,
        message: "Missing Details...",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }


    const uploadResult = await cloudinary.uploader.upload(req.file.path);
    const imageUrl = uploadResult.secure_url;


    const clientId = req.cookies.userId;
    if (!clientId) {
      return res.status(401).json({ success: false, message: "Unauthorized user" });
    }


    const gig = new gigModel({
      title,
      description,
      category,
      budget,
      location,
      image: imageUrl,
      clientId,
    });

    await gig.save();

    res.status(200).json({
      success: true,
      message: "Gig posted successfully",
      gig,
    });
  } catch (error) {
    console.error("Error creating gig:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});

// Mygig
gigsRouter.get("/my-gigs/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    
    const gigs = await gigModel.find({ clientId: new mongoose.Types.ObjectId(id) });
    
    if (!gigs || gigs.length === 0) {
      console.log('donedondon')
      return res.status(404).json({ success: false, message: "No gigs found for this client" });
    }else{
      res.status(200).json({ success: true, gigs });
    }
  } catch (error) {
    console.error("Error fetching gigs:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


//PUT       
gigsRouter.put("/:id", userAuth, upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "gigs",
      });
      updateData.image = uploadResult.secure_url;
    }

    const updatedGig = await gigModel.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedGig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    res.status(200).json({ success: true, gig: updatedGig });
  } catch (error) {
    console.error("Error updating gig:", error);
    res.status(500).json({ message: error.message });
  }
});


/** Get single gig by ID (GET /api/gigs/:id) */
gigsRouter.get("/:id", async (req, res) => {
  try {

    let id = req.params.id;
    id = id.replace(':','');

    const gig = await gigModel.findById(id);
    if (!gig) return res.status(404).json({ message: "Gig not found" });
    res.json(gig);
  } catch (error) {
    console.error("Error fetching gig:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//all gigs 
gigsRouter.get('/', async(req, res) => {
    try {
         const gig = await gigModel.find();
         if(!gig){
             res.status(404).json({success : false, message : "No Gig Found!!"});
         }

         res.status(200).json(gig);

    } catch (error) {
         res.status(500).json({success: false, message : "internal server error!"});
    }
})


gigsRouter.delete('/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const response = await gigModel.findByIdAndDelete(id);

        if(!response) {
          res.status(404).json({success : false, message : "No Gig Found!!"});
        }
        res.status(200).json({success : true, message : "Gig Deleted successfully"});
    } catch (error) {
      res.status(500).json({success: false, message : "internal server error!"});
    }
})




//single gig
// gigsRouter.get('/:id', async(req, res) => {
//   console.log(req.params.id)
//     try {
//         const gigId = req.params.id;
//         const gig = await gigModel.findOne({_id : gigId});


//          if(!gig){
//              res.status(404).json({success : false, message : "No Gig Found!!"});
//          }

//          res.status(200).json(gig);

//     } catch (error) {
//          res.status(500).json({success: false, message : "internal server error!"});
//     }
// })

export default gigsRouter;
