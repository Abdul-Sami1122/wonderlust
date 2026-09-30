const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required().min(0),
    country: Joi.string().required(),
    location: Joi.string().required(),
    category: Joi.string()
      .valid(
        "trending",
        "rooms",
        "iconic_cities",
        "mountain",
        "castels",
        "amazing_pools",
        "camping",
        "farms",
        "arctic"
      )
      .optional(),
    maxGuests: Joi.number().min(1).default(4).optional(),
    image: Joi.any().optional(),
  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    comment: Joi.string().required(),
    rating: Joi.number().required().min(1).max(5),
  }).required(),
});
