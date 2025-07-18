const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();
const db = admin.firestore();

router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("programas").get();
    const programas = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json(programas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection("programas").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Programa no encontrado" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  const { nombre, descripcion, portafolio } = req.body;

  const newPrograma = {
    nombre,
    descripcion,
    portafolio,
  };

  try {
    const docRef = await db.collection("programas").add(newPrograma);
    res.status(201).json({ id: docRef.id, ...newPrograma });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, portafolio } = req.body;

  try {
    const docRef = db.collection("programas").doc(id);
    await docRef.update({ nombre, descripcion, portafolio });
    res.json({ message: "Programa actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = db.collection("programas").doc(id);
    await docRef.delete();
    res.json({ message: "Programa eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;