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

router.post("/nuevaTarea", async (req, res) => {
  const { titulo, descripcion, estado } = req.body;
  const newTask = { titulo, descripcion, estado };

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


router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, estado } = req.body;
  try {
    const docRef = db.collection("tareas").doc(id);
    await docRef.update({ titulo, descripcion, estado });
    res.json({ message: "Tarea actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;