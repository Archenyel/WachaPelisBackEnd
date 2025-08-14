const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();
const db = admin.firestore();

router.get("/", async (req, res) => {
  const { rol } = req.query;
  try {
    const snapshot = await db.collection("usuarios").where("rol", "==", rol).get();
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection("usuarios").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "usuario no encontrado" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, email, telefono, descripcion } = req.body;

  try {
    await db.collection("usuarios").doc(id).update({
      nombre,
      email,
      telefono,
      descripcion,
    });
    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/editadmin/:id", async (req, res) => {
  const { id } = req.params;
  const { usuario, email } = req.body;
  const password = req.body.password || null;

  if (password) {
    await db.collection("usuarios").doc(id).update({
      usuario,
      email,
      password,
    });
  }

  try {
    await db.collection("usuarios").doc(id).update({
      usuario,
      email,
    });
    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});


module.exports = router;
