const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();
const db = admin.firestore();

router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("portafolios").get();
    const portafolios = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json(portafolios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection("portafolios").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Portafolio no encontrado" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  const { nombre, descripcion } = req.body;

  const newPortafolio = {
    nombre,
    descripcion,
    fechaCreacion: new Date().toISOString()
  };

  try {
    const docRef = await db.collection("portafolios").add(newPortafolio);
    res.status(201).json({ id: docRef.id, ...newPortafolio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  try {
    const docRef = db.collection("portafolios").doc(id);
    await docRef.update({ nombre, descripcion });
    res.json({ message: "Portafolio actualizado correctamente", data: { id, nombre, descripcion } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = db.collection("portafolios").doc(id);
    await docRef.delete();
    res.json({ message: "Portafolio eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}); 

module.exports = router;