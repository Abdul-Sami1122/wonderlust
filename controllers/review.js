const listing = require("../Models/listing");  
const Review = require("../Models/review");

// Reviews Requests from Show.js
// 1.Post request Call Back to add data

module.exports.createReview = async(req,res,next)=>{ 
    let Listing = await listing.findById(req.params.id);
    if (!Listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    Listing.reviews.push(newReview);
    console.log(newReview);
    await newReview.save();
    await Listing.save();
    req.flash("success","Review Succefully Added");
    res.redirect(`/listings/${req.params.id}`);
};

// 2. Request Call back to edit review
module.exports.updateReview = async (req, res) => {
    let { id, reviewid } = req.params;
    await Review.findByIdAndUpdate(reviewid, { ...req.body.review });
    req.flash("success", "Review Successfully Updated");
    res.redirect(req.get("referer") || `/listings/${id}`);
};

// 3. Request Call back from review to delete Data
module.exports.destroyReview = async(req,res)=>{
    let {id, reviewid} = req.params;
    if (id && id !== "undefined" && id !== "null") {
      await listing.findByIdAndUpdate(id,{$pull: {reviews: reviewid}});
    } else {
      await listing.updateMany({ reviews: reviewid }, { $pull: { reviews: reviewid } });
    }
    await Review.findByIdAndDelete(reviewid);
    req.flash("success","Review Successfully Deleted");
    res.redirect(req.get("referer") || `/listings/${id}`);
};




