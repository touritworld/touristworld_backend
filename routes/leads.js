import express from "express";
import { auth } from "../middleware/auth.js";
import {
  createLead,
  getLeads,
  updateLeadStage,
  updateLead,
} from "../models/Lead.js";

const router = express.Router();

// Crear un lead
router.post("/", async (req, res) => {
  try {
    const lead = await createLead(req.body);
    res.status(201).json({ message: "Lead creado exitosamente", lead });
  } catch (error) {
    console.error("Error al crear lead:", error);
    res.status(400).json({ error: error.message });
  }
});

// Obtener todos los leads
router.get("/", async (req, res) => {
  //auth, para seguridad
  try {
    const leads = await getLeads();
    res.status(200).json(leads);
  } catch (error) {
    console.error("Error al obtener leads:", error);
    res.status(500).json({ error: "Error al obtener los leads" });
  }
});

// Actualizar el estado de un lead
router.patch("/stage/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    if (!stage) {
      return res.status(400).json({ error: "El campo stage es requerido" });
    }

    const result = await updateLeadStage(id, stage);
    if (!result) {
      return res.status(404).json({ error: "Lead no encontrado" });
    }

    res.status(200).json({ message: "Estado del lead actualizado", result });
  } catch (error) {
    console.error("Error al actualizar estado del lead:", error);
    res.status(400).json({ error: error.message });
  }
});

// Actualizar un lead
router.patch("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const leadData = req.body;

    if (!Object.keys(leadData).length) {
      return res
        .status(400)
        .json({ error: "No se proporcionaron datos para actualizar" });
    }

    const result = await updateLead(id, leadData);
    if (!result) {
      return res.status(404).json({ error: "Lead no encontrado" });
    }

    res.status(200).json({ message: "Lead actualizado exitosamente", result });
  } catch (error) {
    console.error("Error al actualizar lead:", error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
