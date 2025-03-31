const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();
const db = admin.firestore();

router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("WPUsers").get();
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection("WPUsers").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "usuario no encontrado" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, phone, address } = req.body;
  try {
    const docRef = db.collection("WPUsers").doc(id);
    await docRef.update({ name, phone, address });
    res.json({ message: "Datos actualizados correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
