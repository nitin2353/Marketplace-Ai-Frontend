import express from 'express';
import reviewModel from '../models/reviewModel.js';
import userAuth from '../middleware/userAuth.js';
import userModel from "../models/userModel.js";
import gigModel from "../models/gigModel.js";
import mongoose from 'mongoose';


const reviewRouter = express.Router();


reviewRouter.post('/', userAuth, async (req, res) => {
  const { rating, comment, bookingId, freelancerId } = req.body;
  const clientId = req.cookies.userId;

  try {
    const existingReview = await reviewModel.findOne({ clientId, freelancerId, bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already posted a review for this booking.",
      });
    }

    const date = Date.now();
    const newReview = new reviewModel({
      bookingId,
      clientId,
      freelancerId,
      rating,
      comment,
      date,
    });

    await newReview.save();

    return res.status(200).json({
      success: true,
      message: "Your review has been successfully posted.",
    });
  } catch (error) {
    console.error("Error posting review:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});


//single booking review
reviewRouter.get('/get/:id', async(req, res) => {
    
    const {id} = req.params;

    try {
        const review = await reviewModel.aggregate([ { 
                                                        $match : {
                                                            bookingId : new mongoose.Types.ObjectId(id)
                                                        }
                                                    } ]);
        
        if(!review){
            return res.status(404).json({success : true, message : "No Review found"})
        }

        res.status(200).json({success : true, message : review})

    } catch (error) {
          return res.status(500).json({success: false, message : "Server error. Please try again later"});
    }
})


//single freelancer all bookings reviews
reviewRouter.get('/all/:id', async(req, res) => {
    
    const { id }= req.params;

    try {
        const review = await reviewModel.aggregate([ { 
                                                        $match : {
                                                            freelancerId : new mongoose.Types.ObjectId(id)
                                                        }
                                                    } ]);
        
        if(!review){
            return res.status(404).json({success : true, message : "No Review found"})
        }

        res.status(200).json({success : true, message : review})

    } catch (error) {
          return res.status(500).json({success: false, message : "Server error. Please try again later"});
    }
})

//all review for admin pannel
reviewRouter.get("/admin/all", async (req, res) => {
  try {

    const reviews = await reviewModel.find();

    if (!reviews || reviews.length === 0) {
      return res
        .status(404)
        .json({ success: true, message: "No reviews found" });
    }


    const clientIds = [...new Set(reviews.map((r) => r.clientId.toString()))];
    const freelancerIds = [
      ...new Set(reviews.map((r) => r.freelancerId.toString())),
    ];
    const bookingIds = [...new Set(reviews.map((r) => r.bookingId.toString()))];


    const clients = await userModel.find({ _id: { $in: clientIds } });
    const freelancers = await userModel.find({ _id: { $in: freelancerIds } });


    const gigs = await gigModel.find({ _id: { $in: bookingIds } });


    const clientMap = new Map(clients.map((u) => [u._id.toString(), u.name]));
    const freelancerMap = new Map(
      freelancers.map((u) => [u._id.toString(), u.name])
    );
    const gigMap = new Map(gigs.map((g) => [g._id.toString(), g.title]));


    const detailedReviews = reviews.map((r) => ({
      _id: r._id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      client: {
        id: r.clientId,
        name: clientMap.get(r.clientId.toString()) || "Unknown Client",
      },
      freelancer: {
        id: r.freelancerId,
        name: freelancerMap.get(r.freelancerId.toString()) || "Unknown Freelancer",
      },
      gig: {
        id: r.bookingId,
        title: gigMap.get(r.bookingId.toString()) || "Unknown Gig",
      },
    }));

    res.status(200).json({
      success: true,
      total: detailedReviews.length,
      message: detailedReviews,
    });
  } catch (error) {
    console.error("Error fetching admin reviews:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later",
      error: error.message,
    });
  }
});

reviewRouter.delete('/admin/delete/:id', async (req, res) => {
  const { id } = req.params;
  console.log('don')
  try {
    const review = await reviewModel.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "No Review found with this ID",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully ✅",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
});




export default reviewRouter;