const express = require("express");
const admin = require("firebase-admin");
const bcrypt = require("bcrypt");

const router = express.Router();
const db = admin.firestore();
const SECRET_KEY = "patata";
const crypto = require("crypto");

router.post("/login", async (req, res) => {
  const { usuario, password } = req.body;

  const userRef = db.collection("usuarios").where("usuario", "==", usuario);
  const userSnapshot = await userRef.get();

  if (userSnapshot.empty) {
    return res.status(400).json({ error: "Usuario no encontrado" });
  }

  const userDoc = userSnapshot.docs[0];
  const user = userDoc.data();

  console.log("User found:", user);

  //const isMatch = await bcrypt.compare(password, user.password);

  //if (!isMatch) {
  //  return res.status(401).json({ error: "Credenciales incorrectas" });
  //}

  if (user.password !== password) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  res.status(200).json({ message: "Login correcto", rol: user.rol });
});

router.post("/registro", async (req, res) => {
  const { usuario, password, rol } = req.body;

  const userRef = db.collection("usuarios").where("usuario", "==", usuario);
  const userSnapshot = await userRef.get();
  if (!userSnapshot.empty) {
    return res.status(400).json({ error: "El usuario ya existe" });
  }

  //const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    usuario,
    //password: hashedPassword,
    password,
    rol,
  };

  try {
    await db.collection("usuarios").add(newUser);
    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    res.status(500).json({ error: "Error al registrar el usuario" });
  }
});

module.exports = router;
