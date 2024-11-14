const pool = require("../db");

// Controlador para obtener todos los usuarios
const getHobbies = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM hobbies");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHobbies,
};
