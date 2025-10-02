const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const User = require("./user.js");

// Defining Collection Schema
let listingSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        image: {
            url: String,
            filename: String
        },
        price: {
            type: Number
        },
        location: {
            type: String,
        },
        country: {
            type: String
        },
        reviews: [{
            type: Schema.Types.ObjectId,
            ref: "Review" 
        }],
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        category: {
            type: String,
            enum: ['trending','rooms','iconic_cities','mountain','castels','amazing_pools','camping','farms','arctic'],
            required: true
        },
        geometry: {
            type: {
                  type: String, // Don't do `{ location: { type: String } }`
                  enum: ['Point'], // 'location.type' must be 'Point'
                  required: true
                  },
            coordinates: {
                 type: [Number],
                 required: true
                 }
                 }
},
    { 
        timestamps: true 
    }
);

// Post MiddleWare

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing)
    {
        await Review.deleteMany({_id: {$in: listing.reviews}});
    }
});


// Defining Model
const listing = mongoose.model("listing", listingSchema);

module.exports = listing;

