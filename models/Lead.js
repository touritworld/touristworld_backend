import { connectPostgres } from '../config/dbConfig.js';

/**
 * Crea un nuevo lead en la base de datos.
 * @param {Object} leadData - Datos del lead.
 * @returns {Object} Resultado de la inserción.
 */
export async function createLead(leadData) {
  const client = await connectPostgres();
  const query = `
    INSERT INTO leads (
      nombre, telefono, email, empresa, origen, destino,
      fecha, hora, pasajeros, tipoVehiculo, tipoServicio,
      esperaEnDestino, requisitos, etapa
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *;
  `;
  const values = [
    leadData.nombre, leadData.telefono, leadData.email, leadData.empresa,
    leadData.origen, leadData.destino, new Date(leadData.fecha), leadData.hora,
    leadData.pasajeros, leadData.tipoVehiculo, leadData.tipoServicio,
    leadData.esperaEnDestino, leadData.requisitos, 'Sin contactar',
  ];

  try {
    const result = await client.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error al crear lead:', error);
    throw error;
  }
}

/**
 * Obtiene todos los leads de la base de datos.
 * @returns {Array} Lista de leads.
 */
export async function getLeads() {
  const client = await connectPostgres();
  const query = 'SELECT * FROM leads ORDER BY fecha DESC;';

  try {
    const result = await client.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error al obtener leads:', error);
    throw error;
  }
}

/**
 * Actualiza el estado de un lead específico.
 * @param {number} leadId - ID del lead.
 * @param {string} newStage - Nuevo estado del lead.
 * @returns {Object} Lead actualizado.
 */
export async function updateLeadStage(leadId, newStage) {
  const client = await connectPostgres();
  const query = `
    UPDATE leads
    SET etapa = $1
    WHERE id = $2
    RETURNING *;
  `;
  const values = [newStage, leadId];

  try {
    const result = await client.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error al actualizar etapa del lead:', error);
    throw error;
  }
}

/**
 * Actualiza un lead específico con nuevos datos.
 * @param {number} id - ID del lead.
 * @param {Object} leadData - Datos del lead a actualizar.
 * @returns {Object} Lead actualizado.
 */
export async function updateLead(id, leadData) {
  const client = await connectPostgres();
  const fields = [];
  const values = [];
  let index = 1;

  for (const [key, value] of Object.entries(leadData)) {
    if (value !== undefined) {
      fields.push(`${key} = $${index}`);
      values.push(value);
      index++;
    }
  }

  if (fields.length === 0) {
    throw new Error('No se proporcionaron campos para actualizar');
  }

  const query = `
    UPDATE leads
    SET ${fields.join(', ')}
    WHERE id = $${index}
    RETURNING *;
  `;
  values.push(id);

  try {
    const result = await client.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error al actualizar lead:', error);
    throw error;
  }
}
