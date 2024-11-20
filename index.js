import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import leadsRoutes from './routes/leads.js';
import inicioRoutes from "./routes/inicio.js"
import { connectPostgres, disconnectPostgres } from './config/dbConfig.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
 
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.get("/api/", inicioRoutes)

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Inicia el servidor
(async () => {
  try {
    await connectPostgres(); // Conexión a PostgreSQL
    app.listen(port, () => {
      console.log(`Servidor corriendo en el puerto ${port}`);
    });

    // Maneja desconexión al detener el servidor
    process.on('SIGINT', async () => {
      console.log('\nCerrando servidor...');
      await disconnectPostgres(); // Desconexión segura
      process.exit(0);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
  }
})();
