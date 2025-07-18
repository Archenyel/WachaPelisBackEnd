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

  //const isMatch = await bcrypt.compare(password, user.password);

  //if (!isMatch) {
  //  return res.status(401).json({ error: "Credenciales incorrectas" });
  //}

  if (user.password !== password) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  res.status(200).json({ message: "Login correcto", rol: user.rol });
});

router.post("/registro/alumnos", async (req, res) => {
  const { nombre, apellidos, email, usuario, password, matricula, carrera, cuatrimestre } = req.body;


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
    rol: "2",
    nombre,
    apellidos,
    email,
    matricula,
    carrera,
    cuatrimestre,
  };

  try {
    await db.collection("usuarios").add(newUser);
    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar el usuario" });
  }
});

router.post("/registro/admins", async (req, res) => {
  const { usuario, password, email } = req.body;

  const userRef = db.collection("usuarios").where("usuario", "==", usuario);
  const userSnapshot = await userRef.get();
  if (!userSnapshot.empty) {
    return res.status(400).json({ error: "El usuario ya existe" });
  }

  //const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    usuario,
    //password: hashedPassword,
    email,
    password,
    rol: "1",
  };

  try {
    await db.collection("usuarios").add(newUser);
    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar el usuario" });
  }
});

router.delete("/eliminar/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const userRef = db.collection("usuarios").doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    await userRef.delete();
    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el usuario" });
  }
});

module.exports = router;
