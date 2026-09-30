const listing = require("./Models/listing");
const Review = require("./Models/review");
const ExpressError = require("./utils/ExpressError");
const { listingSchema, reviewSchema } = require("./Schema.js");


module.exports.isLoggedIn = (req,res,next)=>{
    // console.log(req.path, ".....", req.orignalUrl);
     if(!req.isAuthenticated()){
        // Redirect URL save process
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be logged in to create listings");
        return res.redirect("/login")
    }
    else{
        next();
    }
};


module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next(); 
}; 



module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let targetListing = await listing.findById(id);
    if (!targetListing) {
        req.flash("error", "Listing you requested does not exist.");
        return res.redirect("/listings");
    }
    if (!targetListing.owner.equals(res.locals.currentUser._id)) {
        req.flash("error", "You don't have permission to Edit this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};


// Review authorization
module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewid } = req.params;
    let review = await Review.findById(reviewid);
    if (!review) {
        req.flash("error", "Review you requested does not exist.");
        return res.redirect(`/listings/${id}`);
    }
    if (!review.author.equals(res.locals.currentUser._id)) {
        req.flash("error", "You don't have permission to Delete this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// Function to validate the listing schema (Define in the Schema.js file)
module.exports. validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",")
        throw new ExpressError(400,errMsg)
    }
    else{
         next();
     }
};

// Validation function for review Schema
module.exports.validateReview = (req,res,next)=>{
    console.log(req.body);
    let {error} = reviewSchema.validate(req.body,{ abortEarly: false });
    if(error){
        console.log("Validation error:", error.details);
        let errMsg = error.details.map((el)=>el.message).join(",")
        throw new ExpressError(400,errMsg);
    }
    else{
         next();
     }
};