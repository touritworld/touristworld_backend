import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = process.env.DATABASE_URL
  ? { 
      connectionString: process.env.DATABASE_URL, 
      ssl: { rejectUnauthorized: false }, 
      dbEngine: process.env.DB_ENGINE } // Configuración para Vercel
  : {
      user: process.env.DB_USER, // Configuración local
      host: process.env.DB_SERVER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT, 10),
    };

let pool = null;

// Conexión a PostgreSQL
export async function connectPostgres() {
  if (pool) {
    return pool; // Reutilizamos la conexión si ya está establecida
  }

  pool = new Pool(dbConfig); // Usamos Pool para gestionar conexiones

  try {
    await pool.query('SELECT 1'); // Prueba básica para validar la conexión
    console.log(
      process.env.DATABASE_URL
        ? 'Conectado a PostgreSQL en Vercel'
        : 'Conectado a PostgreSQL local'
    );
    return pool;
  } catch (error) {
    console.error('Error de conexión a PostgreSQL:', error);
    pool = null; // Reiniciamos el pool si falla
    throw error;
  }
}

// Desconectar PostgreSQL
export async function disconnectPostgres() {
  if (pool) {
    try {
      await pool.end();
      console.log('Desconexión de PostgreSQL exitosa');
      pool = null;
    } catch (error) {
      console.error('Error al desconectar de PostgreSQL:', error);
      throw error;
    }
  }
}
