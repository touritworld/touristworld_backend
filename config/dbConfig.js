import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10), // Aseguramos el número entero
};

let client = null;

export async function connectPostgres() {
  if (client) {
    return client; // Reutilizamos la conexión si ya está establecida
  }

  client = new Client(dbConfig);

  try {
    await client.connect();
    console.log('Conectado a PostgreSQL');
    return client;
  } catch (error) {
    console.error('Error de conexión a PostgreSQL:', error);
    client = null; // Reiniciamos el cliente si falla
    throw error;
  }
}

export async function disconnectPostgres() {
  if (client) {
    try {
      await client.end();
      console.log('Desconexión de PostgreSQL exitosa');
      client = null;
    } catch (error) {
      console.error('Error al desconectar de PostgreSQL:', error);
      throw error;
    }
  }
}
