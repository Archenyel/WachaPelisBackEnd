const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();
const db = admin.firestore();

router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("tareas").get();
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection("tareas").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/proyecto/:proyectoId", async (req, res) => {
  const { proyectoId } = req.params;
  try {
    const snapshot = await db.collection("tareas").where("proyectoId", "==", proyectoId).get();
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/nuevaTarea", async (req, res) => {
  const { titulo, descripcion, estado, prioridad, responsable, progreso, proyectoId, comentarios } = req.body;
  const newTask = { titulo, descripcion, estado, prioridad, responsable, progreso, proyectoId, comentarios };

  if (!comentarios) {
    newTask.comentarios = [];
  }

  try {
    const docRef = await db.collection("tareas").add(newTask);
    res.status(201).json({ id: docRef.id, ...newTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/asignarTarea", async (req, res) => {
  const { tareaId, usuarioId } = req.body;
    try {
        const tareaRef = db.collection("tareas").doc(tareaId);
        const usuarioRef = db.collection("usuarios").doc(usuarioId);
    
        await tareaRef.update({ asignadoA: usuarioRef });
        res.json({ message: "Tarea asignada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const docRef = db.collection("tareas").doc(id);
    await docRef.delete();
    res.json({ message: "Tarea eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/actualizarEstado/:id", async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const docRef = db.collection("tareas").doc(id);
    await docRef.update({ estado });
    res.json({ message: "Estado de la tarea actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/archivoUrl/:id", async (req, res) => {
  const { id } = req.params;
  const { archivoUrl } = req.body;
  try {
    const docRef = db.collection("tareas").doc(id);
    await docRef.update({ archivoUrl });
    res.json({ message: "URL del archivo actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, estado, prioridad, responsable, progreso, proyectoId, } = req.body;
  const comentarios = req.body.comentarios || [];
  try {
    const docRef = db.collection("tareas").doc(id);

    if (comentarios.length > 0) {
      await docRef.update({ titulo, descripcion, estado, prioridad, responsable, progreso, proyectoId, comentarios });
    }
    else {
      await docRef.update({ titulo, descripcion, estado, prioridad, responsable, progreso, proyectoId });
    }

    res.json({ message: "Tarea actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;