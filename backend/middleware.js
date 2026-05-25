const jwt = require("jsonwebtoken");

const SECRET_KEY = "WAN_HOTEL_SECRET";

const authenticateToken = (req, res, next) => {

  const authHeader =
    req.headers["authorization"];

  const token =
    authHeader &&
    authHeader.split(" ")[1];

  if (!token) {

    return res.status(401).json({
      message: "Token tidak ada"
    });

  }

  jwt.verify(
    token,
    SECRET_KEY,
    (err, user) => {

      if (err) {

        return res.status(403).json({
          message: "Token salah"
        });

      }

      req.user = user;

      next();

    }
  );

};

module.exports = {
  authenticateToken,
  SECRET_KEY
};