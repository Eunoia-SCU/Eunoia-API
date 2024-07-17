const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createServiceValidator = [
    check("businessName")
    .isLength({ min: 3 })
    .withMessage("Too Short Service name")
    .isLength({ max: 225 })
    .withMessage("Too long Service name")
    .notEmpty()
    .withMessage("Please enter your Service name!"),
    check("about")
    .optional()
    .isLength({ max: 5000 })
    .withMessage("Too long description"),
    check("location")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Location is too short")
    .isLength({ max: 225 })
    .withMessage("Location is too long"),
    check("businessCategory")
    .isIn([
        "Venues",
        "Photographers",
        "Event",
        "Planners",
        "DJs",
        "Makeup Artists",
        "Food",
        "Hair Stylists",
        "Other",
    ])
    .withMessage("businessCategory Required")
    .isLength({ min: 3 })
    .withMessage("Too Short category name")
    .isLength({ max: 255 })
    .withMessage("Too long category name"),
    check("phoneNumber")
    .isNumeric()
    .withMessage("Please Enter valid Phone Number"),
    validatorMiddleware,
];
exports.getServiceValidator = [
    check("id").isMongoId().withMessage("Invalid ID format"),
    validatorMiddleware,
];
exports.updateServiceValidator = [
    check("id").isMongoId().withMessage("Invalid ID format"),
    validatorMiddleware,
];
exports.deleteServiceValidator = [
    check("id").isMongoId().withMessage("Invalid ID format"),
    validatorMiddleware,
];