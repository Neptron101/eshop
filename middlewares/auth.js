const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const errorResponse = require('../utils/errorResponse');

const User = require('../models/User');

//Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    //Set Token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  //Commented to only use Bearer token in header for auth
  // else if (req.cookies.token) {
  //   //Set TOken from cookie
  //   token = req.cookies.token;
  // }

  // Make sure token exists
  if (!token) {
    return next(new errorResponse('Not Authorized to access this route', 401));
  }

  //
  try {
    //Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded);

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new errorResponse('Not Authorized to access this route', 401));
  }
});

// Grant Access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new errorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
