const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");

// Middleware para verificar el token JWT
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ message: "Token no proporcionado" });
  }
  const tokenWithoutBearer = token.startsWith("Bearer ")
    ? token.slice(7, token.length)
    : token;

  jwt.verify(tokenWithoutBearer, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido" });
    }

    req.userId = decoded.userId;
    req.userRole = decoded.role;

    next();
  });
};

module.exports = verifyToken;
