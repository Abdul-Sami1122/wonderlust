const listing = require("../Models/listing");  
const Review = require("../Models/review");

// Reviews Requests from Show.js
// 1.Post request Call Back to add data

module.exports.createReview = async(req,res,next)=>{ 
    let Listing = await listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview);
    Listing.reviews.push(newReview);
    console.log(newReview);
    await newReview.save();
    await Listing.save();
    req.flash("success","Review Succefully Added");
    res.redirect(`/listings/${req.params.id}`);
};

// 2.Request Call back from review to delete Data

module.exports.destroyReview = async(req,res)=>{
    let {id, reviewid} = req.params;
    await listing.findByIdAndUpdate(id,{$pull: {reviews: reviewid}});
    await Review.findByIdAndDelete(reviewid);
    req.flash("success","Review Succefully Deleted");
    res.redirect(`/listings/${id}`);
};




