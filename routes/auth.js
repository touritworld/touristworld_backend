import express from 'express';
import {
  createUser,
  findUserByCredentials,
  updatePassword,
} from '../models/User.js';

const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { usuario, password, nombre, rol } = req.body;

    // Validación de datos
    if (!usuario || !password || !nombre || !rol) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    await createUser({ usuario, password, nombre, rol });
    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validación de datos
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
    }

    const { user, token } = await findUserByCredentials(username, password);
    res.status(200).json({ message: 'Inicio de sesión exitoso', user, token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
});

// Actualización de contraseña
router.patch('/password', async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;

    // Validación de datos
    if (!username || !oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: 'Usuario, contraseña anterior y nueva son requeridos' });
    }

    const result = await updatePassword(username, oldPassword, newPassword);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al actualizar contraseña:', error.message);
    res.status(500).json({ error: 'No se pudo actualizar la contraseña' });
  }
});

export default router;
