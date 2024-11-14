const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { cloudinary, jwtSecret } = require("../config");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configurar Multer para almacenar en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user_images",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});
const upload = multer({ storage });

// Controlador para obtener todos los usuarios
const getUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM usuarios");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controlador para obtener un usuario por ID
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controlador para crear usuario
const createUser = async (req, res) => {
  const {
    nombre,
    apellido,
    correo,
    password,
    rol,
    rfc,
    curp,
    calle,
    colonia,
    municipio,
    codigo_postal,
    numero,
  } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      "INSERT INTO usuarios (nombre, apellido, correo, password, rol, rfc, curp, calle, colonia, municipio, codigo_postal, numero, url_imagen) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *",
      [
        nombre,
        apellido,
        correo,
        hashedPassword,
        rol,
        rfc,
        curp,
        calle,
        colonia,
        municipio,
        codigo_postal,
        numero,
        req.file ? req.file.path : null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controlador para registrar usuario
const registerUser = async (req, res) => {
  const {
    nombre,
    apellido,
    correo,
    password,
    rol,
    rfc,
    curp,
    calle,
    colonia,
    municipio,
    codigo_postal,
    numero,
  } = req.body;

  // Validar si el correo ya existe en la base de datos
  try {
    const userExists = await pool.query(
      "SELECT * FROM usuarios WHERE correo = $1",
      [correo]
    );
    if (userExists.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "El correo electrónico ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Guardar el nuevo usuario
    const result = await pool.query(
      "INSERT INTO usuarios (nombre, apellido, correo, password, rol, rfc, curp, calle, colonia, municipio, codigo_postal, numero, url_imagen) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *",
      [
        nombre,
        apellido,
        correo,
        hashedPassword,
        rol,
        rfc,
        curp,
        calle,
        colonia,
        municipio,
        codigo_postal,
        numero,
        req.file ? req.file.path : null, // Si hay imagen, la guardamos en Cloudinary
      ]
    );

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controlador para actualizar usuario
const updateUser = async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    apellido,
    correo,
    rol,
    rfc,
    curp,
    calle,
    colonia,
    municipio,
    codigo_postal,
    numero,
  } = req.body;

  try {
    const camposActualizados = [
      nombre,
      apellido,
      correo,
      rol,
      rfc,
      curp,
      calle,
      colonia,
      municipio,
      codigo_postal,
      numero,
      req.file ? req.file.path : null, // Si se carga una nueva imagen, se usa req.file.path; de lo contrario, se mantiene la imagen actual
    ];

    const query = `
        UPDATE usuarios 
        SET nombre = $1, apellido = $2, correo = $3, rol = $4, rfc = $5, curp = $6, calle = $7, colonia = $8, municipio = $9, codigo_postal = $10, numero = $11, url_imagen = COALESCE($12, url_imagen)
        WHERE id = $13
        RETURNING *
      `;

    const result = await pool.query(query, [...camposActualizados, id]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controlador para eliminar usuario
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM usuarios WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controlador de inicio de sesión
const loginUser = async (req, res) => {
  const { correo, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE correo = $1",
      [correo]
    );
    if (result.rows.length === 0)
      return res.status(400).json({ message: "Usuario no encontrado" });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign({ userId: user.id, role: user.rol }, jwtSecret, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createUser,
  registerUser,
  loginUser,
  upload,
  updateUser,
  deleteUser,
  getUsers,
  getUserById,
};
