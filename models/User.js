import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectPostgres } from '../config/dbConfig.js';

/**
 * Crea un nuevo usuario en la base de datos.
 * @param {Object} userData - Datos del usuario.
 * @returns {Object} Resultado de la inserción.
 */
export async function createUser(userData) {
  const client = await connectPostgres();
  const hashedPassword = await bcrypt.hash(userData.password, 8);
  
  const query = `
    INSERT INTO usuarios (usuario, password, nombre, rol)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [userData.usuario, hashedPassword, userData.nombre, userData.rol];

  try {
    const result = await client.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
}

/**
 * Busca un usuario por credenciales y genera un token JWT.
 * @param {string} username - Nombre de usuario.
 * @param {string} password - Contraseña.
 * @returns {Object} Usuario y token.
 */
export async function findUserByCredentials(username, password) {
  const client = await connectPostgres();
  const query = 'SELECT * FROM usuarios WHERE usuario = $1;';
  const values = [username];

  try {
    const result = await client.query(query, values);
    const user = result.rows[0];
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Contraseña incorrecta');
    }

    const token = jwt.sign(
      { id: user.id, username: user.usuario, role: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { user, token };
  } catch (error) {
    console.error('Error en autenticación:', error);
    throw error;
  }
}

/**
 * Actualiza la contraseña de un usuario.
 * @param {string} username - Nombre de usuario.
 * @param {string} oldPassword - Contraseña anterior.
 * @param {string} newPassword - Nueva contraseña.
 * @returns {Object} Mensaje de resultado.
 */
export async function updatePassword(username, oldPassword, newPassword) {
  const client = await connectPostgres();

  try {
    // Obtener datos del usuario por nombre de usuario
    const queryUser = 'SELECT id, password FROM usuarios WHERE usuario = $1;';
    const userResult = await client.query(queryUser, [username]);
    const user = userResult.rows[0];

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar si la contraseña anterior coincide
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new Error('La contraseña anterior no es correcta');
    }

    // Generar el hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 8);

    // Actualizar la contraseña
    const queryUpdate = `
      UPDATE usuarios
      SET password = $1
      WHERE id = $2
      RETURNING *;
    `;
    const updateResult = await client.query(queryUpdate, [hashedPassword, user.id]);

    return updateResult.rowCount > 0
      ? { message: 'Contraseña actualizada exitosamente' }
      : { message: 'No se pudo actualizar la contraseña' };
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    throw error;
  }
}
