const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { cloudinary, jwtSecret } = require("../config");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user_images",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});
const upload = multer({ storage });

const getMe = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No autorizado" });
    }
    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;
    const result = await pool.query("SELECT * FROM usuarios WHERE id = $1", [
      userId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los datos del usuario" });
  }
};

const getUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM usuarios");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

const getUserHobbies = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT h.id, h.descripcion 
      FROM usuario_hobbies uh
      JOIN hobbies h ON uh.hobbie_id = h.id
      WHERE uh.usuario_id = $1
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron hobbies para este usuario" });
    }
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener hobbies del usuario:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los hobbies del usuario" });
  }
};

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
    codigo_postal,
    numero,
    hobbies,
    url_imagen,
  } = req.body;

  try {
    // Validación de correo electrónico existente
    const emailExists = await pool.query(
      "SELECT * FROM usuarios WHERE correo = $1",
      [correo]
    );
    if (emailExists.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "El correo electrónico ya está registrado" });
    }

    const curpExists = await pool.query(
      "SELECT * FROM usuarios WHERE curp = $1",
      [curp]
    );
    if (curpExists.rows.length > 0) {
      return res.status(400).json({ message: "El CURP ya está registrado" });
    }

    const rfcExists = await pool.query(
      "SELECT * FROM usuarios WHERE rfc = $1",
      [rfc]
    );
    if (rfcExists.rows.length > 0) {
      return res.status(400).json({ message: "El RFC ya está registrado" });
    }

    if (!password) {
      return res.status(400).json({ message: "La contraseña es requerida" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO usuarios 
      (nombre, apellido, correo, password, rol, rfc, curp, calle, colonia, codigo_postal, numero, url_imagen) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING *`,
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
        codigo_postal,
        numero,
        url_imagen,
      ]
    );

    const userId = result.rows[0].id;
    if (hobbies && hobbies.length > 0) {
      const hobbyValues = hobbies
        .map((hobbyId) => `(${userId}, ${hobbyId})`)
        .join(", ");
      await pool.query(
        `INSERT INTO usuario_hobbies (usuario_id, hobbie_id) VALUES ${hobbyValues}`
      );
    }

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
};

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
    codigo_postal,
    numero,
    hobbies,
  } = req.body;

  try {
    // Validación de correo existente en otros usuarios
    if (correo) {
      const emailExists = await pool.query(
        "SELECT * FROM usuarios WHERE correo = $1 AND id != $2",
        [correo, id]
      );
      if (emailExists.rows.length > 0) {
        return res.status(400).json({
          message: "El correo electrónico ya está registrado en otro usuario",
        });
      }
    }

    // Validación de CURP existente en otros usuarios
    if (curp) {
      const curpExists = await pool.query(
        "SELECT * FROM usuarios WHERE curp = $1 AND id != $2",
        [curp, id]
      );
      if (curpExists.rows.length > 0) {
        return res
          .status(400)
          .json({ message: "El CURP ya está registrado en otro usuario" });
      }
    }

    // Validación de RFC existente en otros usuarios
    if (rfc) {
      const rfcExists = await pool.query(
        "SELECT * FROM usuarios WHERE rfc = $1 AND id != $2",
        [rfc, id]
      );
      if (rfcExists.rows.length > 0) {
        return res
          .status(400)
          .json({ message: "El RFC ya está registrado en otro usuario" });
      }
    }

    const camposActualizados = [
      nombre,
      apellido,
      correo,
      rol,
      rfc,
      curp,
      calle,
      colonia,
      codigo_postal,
      numero,
      req.file ? req.file.path : null,
    ];

    const query = `
      UPDATE usuarios 
      SET nombre = $1, apellido = $2, correo = $3, rol = $4, rfc = $5, curp = $6, calle = $7, colonia = $8, codigo_postal = $9, numero = $10, url_imagen = COALESCE($11, url_imagen)
      WHERE id = $12
      RETURNING *
    `;
    const result = await pool.query(query, [...camposActualizados, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (hobbies && hobbies.length > 0) {
      await pool.query("DELETE FROM usuario_hobbies WHERE usuario_id = $1", [
        id,
      ]);
      const hobbyQueries = hobbies.map((hobbyId) => {
        return pool.query(
          "INSERT INTO usuario_hobbies (usuario_id, hobbie_id) VALUES ($1, $2)",
          [id, hobbyId]
        );
      });
      await Promise.all(hobbyQueries);
    }

    res.json({
      message: "Usuario y hobbies actualizados exitosamente",
      user: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
  registerUser,
  loginUser,
  upload,
  updateUser,
  deleteUser,
  getUsers,
  getUserById,
  getMe,
  getUserHobbies,
};
