const express = require("express");
const admin = require("firebase-admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();
const db = admin.firestore();
const SECRET_KEY = "patata";

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const snapshot = await db
      .collection("WPUsers")
      .where("email", "==", email)
      .get();
    if (snapshot.empty) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      { id: userDoc.id, email: userData.email },
      SECRET_KEY,
      { expiresIn: "2h" }
    );

    res.json({ token, user: userData.name, role: userData.role });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
});

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const snapshot = await db
      .collection("WPUsers")
      .where("email", "==", email)
      .get();
    if (!snapshot.empty) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRef = await db.collection("WPUsers").add({
      email,
      password: hashedPassword,
      name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ id: userRef.id, email, name });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

module.exports = router;
