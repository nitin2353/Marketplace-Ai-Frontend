import express from 'express';
import bookingModel from '../models/bookingModel.js'
import gigModel from '../models/gigModel.js';
import userAuth from '../middleware/userAuth.js';
import userModel from '../models/userModel.js';
import mongoose from 'mongoose';

const bookingRouter = express();



bookingRouter.get('/accept/:id', userAuth, async(req, res) => {        
    const gigId = req.params.id;

    try {

        const gig = await gigModel.findOne({ _id : gigId });
        
        if (!gig) {
            return res.status(404).json({ success: false, message: "Gig not found" });
        }
        
        let freelancerId = req.cookies.userId;
        let clientId = gig.clientId;
        let amount = gig.budget;
        let status = gig.status;

    

        try {
            const response = new bookingModel({gigId, freelancerId, clientId, amount, status});
            await response.save();
            res.status(200).json({success:true, message: "Successfully Booked..."}) 

        } catch (error) {
            res.status(500).json({success:false, message: "Internal Server Error"}) 
        }
    

    } catch (error) {
        res.status(500).json({success: false, message : "internal server error"});
    }
})


bookingRouter.get("/all", userAuth, async (req, res) => {
  try {

    const uid = req.cookies.userId;

    if (!uid) {
      return res.status(401).json({ success: false, message: "Unauthorized user" });
    }


    const bookings = await bookingModel.find({ freelancerId: uid });

    const uniqueBookings = bookings.filter(
      (booking, index, self) =>
        index === self.findIndex((b) => b.gigId.toString() === booking.gigId.toString())
    );


    if (!bookings || bookings.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        bookings: [],
        message: "No bookings yet!",
      });
    }

    res.status(200).json({success: true, message : uniqueBookings})



  } catch (error) {
    console.error("Error in /booking/all route:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});







bookingRouter.get('/client/workers/:uid', userAuth, async (req, res) => {
    try {
      const { uid } = req.params;
      if(!uid) return res.json('uid is missing')
      const UserBookings = await bookingModel.find({clientId : new mongoose.Types.ObjectId(uid)});
      
      
      if (UserBookings.length === 0) {
        return res.status(404).json({ success: false, message: "No gig Found" });
      }


      const workArray = await Promise.all(
        UserBookings.map(async (booking) => {
          return await userModel.findById(booking.freelancerId);
        })
      );
      
      res.json({"UserBookings" : UserBookings , "workers" : workArray})

      
      
    } catch (error) {
      res.json(error)
    }
})





bookingRouter.get("/all/booked", userAuth, async (req, res) => {
  try {
    const uid = req.cookies.userId;

    if (!uid) {
      return res.status(401).json({ success: false, message: "Unauthorized user" });
    }

    const gigIds = await bookingModel.distinct("gigId", { freelancerId: uid });

    const bookings = await Promise.all(
      gigIds.map(async (gid) => await bookingModel.findOne({ gigId: gid, freelancerId: uid }))
    );


    if (!bookings || bookings.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        bookings: [],
        message: "No bookings yet!",
      });
    }

    const uniqueGigIds = [...new Set(bookings.map(b => b.gigId.toString()))];

    const gigs = await gigModel.find({ _id: { $in: uniqueGigIds } });

    const clientIds = [...new Set(gigs.map(g => g.clientId.toString()))];

    const clients = await userModel.find({ _id: { $in: clientIds } });

    const clientMap = new Map(clients.map(c => [c._id.toString(), c.name]));
    const gigMap = new Map(gigs.map(g => [g._id.toString(), g]));

    const bookingDetailArray = bookings.map((booking) => {
      const gig = gigMap.get(booking.gigId.toString());
      if (!gig) return null;

      const clientName = clientMap.get(gig.clientId.toString()) || "Unknown";

      return {
        gigId: gig._id,
        bookingId: booking._id,
        name: clientName,
        title: gig.title,
        status: booking.status,
        amount: gig.budget,
      };
    }).filter(Boolean);

    res.status(200).json({
      success: true,
      total: bookingDetailArray.length,
      bookings: bookingDetailArray,
    });

  } catch (error) {
    console.error("Error in /booking/all route:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});




bookingRouter.put('/status', async (req, res) => {
  try {
    const { status, bookingId } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required!" });
    }

    const updatedBooking = await bookingModel.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true } 
    );

    if (!updatedBooking) {
      return res.status(404).json({ success: false, message: "Booking not found!" });
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully!",
      booking: updatedBooking,
    });

  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
});



// click on single from list of bookings
bookingRouter.get('/:bookingId', async(req, res) => {            //  showing single booking
   
    const bookingId = req.params.bookingId;
    
    try {

        const bookedGig = await bookingModel.findOne({_id : bookingId})

        if(!bookedGig){
             return res.status(404).json({ success: false, message: "Gig not found" });
        }

        return res.status(200).json(bookedGig)
    
    } catch (error) {
        res.status(500).json({success: false, message : "internal server error!"});
    }  
    
})



bookingRouter.get("/admin/all", async (req, res) => {
  try {
    // Fetch all bookings (no user restriction)
    const bookings = await bookingModel.find();

    if (!bookings || bookings.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        bookings: [],
        message: "No bookings yet!",
      });
    }

    // Collect unique gigIds and clientIds
    const gigIds = [...new Set(bookings.map(b => b.gigId.toString()))];
    const freelancerIds = [...new Set(bookings.map(b => b.freelancerId.toString()))];
    const clientIds = [...new Set(bookings.map(b => b.clientId.toString()))];

    // Fetch related data
    const gigs = await gigModel.find({ _id: { $in: gigIds } });
    const clients = await userModel.find({ _id: { $in: clientIds } });
    const freelancers = await userModel.find({ _id: { $in: freelancerIds } });

    // Create quick lookup maps
    const gigMap = new Map(gigs.map(g => [g._id.toString(), g]));
    const clientMap = new Map(clients.map(c => [c._id.toString(), c.name]));
    const freelancerMap = new Map(freelancers.map(f => [f._id.toString(), f.name]));

    // Merge everything neatly
    const bookingDetailArray = bookings.map((booking) => {
      const gig = gigMap.get(booking.gigId.toString());
      const clientName = clientMap.get(booking.clientId.toString()) || "Unknown Client";
      const freelancerName = freelancerMap.get(booking.freelancerId.toString()) || "Unknown Freelancer";

      return {
        bookingId: booking._id,
        gigId: booking.gigId,
        title: gig ? gig.title : "Untitled Gig",
        clientName,
        freelancerName,
        amount: booking.amount || (gig ? gig.budget : 0),
        status: booking.status,
        createdAt: booking.createdAt,
      };
    });

    // Send response
    res.status(200).json({
      success: true,
      total: bookingDetailArray.length,
      bookings: bookingDetailArray,
    });

  } catch (error) {
    console.error("Error in /booking/admin/all route:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});



bookingRouter.delete("/admin/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const bookings = await bookingModel.findByIdAndDelete(id);


    if (!bookings) {
      return res.status(404).json({
        success: true,
        total: 0,
        bookings: [],
        message: "No booking Find!",
      });
    }

    res.status(200).json({success: true, message : "Booking Deleted Successfully"})



  } catch (error) {
    console.error("Error in /booking/all route:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});






export default bookingRouter;