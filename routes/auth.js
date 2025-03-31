const express = require("express");
const admin = require("firebase-admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();
const db = admin.firestore();
const SECRET_KEY = "patata";
const crypto = require("crypto");
const nodemailer = require("nodemailer");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userRef = db.collection("WPUsers").where("email", "==", email);
  const userSnapshot = await userRef.get();

  if (userSnapshot.empty) {
    return res.status(400).json({ error: "Usuario no encontrado" });
  }

  const userDoc = userSnapshot.docs[0];
  const user = userDoc.data();

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  // Generar código 2FA
  const code = crypto.randomInt(100000, 999999).toString();
  await db.collection("2fa_codes").doc(userDoc.id).set({
    code,
    createdAt: new Date(),
  });

  // Enviar código por email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "bluebearinnovations@gmail.com",
      pass: "vtrv sbus hjjw chce",
    },
  });

  await transporter.sendMail({
    from: "tuemail@gmail.com",
    to: email,
    subject: "Tu código de autenticación de WACHA PELIS",
    text: `Tu código de verificación es: ${code}`,
  });

  res.json({ message: "Código enviado al correo", userId: userDoc.id });
});

router.post("/verify-2fa", async (req, res) => {
  const { userId, code } = req.body;
  const codeRef = db.collection("2fa_codes").doc(userId);
  const userRef = db.collection("WPUsers").doc(userId);
  const userSnapshot = await userRef.get();
  const codeSnapshot = await codeRef.get();

  if (!codeSnapshot.exists) {
    return res.status(400).json({ error: "Código no encontrado o expirado" });
  }

  const storedCode = codeSnapshot.data();
  const createdAt = storedCode.createdAt.toDate();
  const now = new Date();
  const expirationTime = 5 * 60 * 1000;

  const user = userSnapshot.data();

  if (now - createdAt > expirationTime) {
    await codeRef.delete();
    return res.status(401).json({ error: "Código expirado" });
  }

  if (storedCode.code !== code) {
    return res.status(401).json({ error: "Código incorrecto" });
  }

  const token = jwt.sign({ userId }, "secreto", { expiresIn: "1h" });

  await codeRef.delete();

  res.json({ token, user: user.name, role: user.role, userId });
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
      role: "user",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ id: userRef.id, email, name });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const userRef = db.collection("WPUsers").where("email", "==", email);
  const userSnapshot = await userRef.get();

  if (userSnapshot.empty) {
    return res.status(400).json({ error: "Usuario no encontrado" });
  }

  const userDoc = userSnapshot.docs[0];
  const user = userDoc.data();

  const code = crypto.randomBytes(3).toString("hex");

  await db.collection("recovery").doc(email).set({
    code,
    createdAt: new Date(),
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "bluebearinnovations@gmail.com",
      pass: "vtrv sbus hjjw chce",
    },
  });

  await transporter.sendMail({
    from: "tuemail@gmail.com",
    to: email,
    subject: "Tu código de recuperacion de WACHA PELIS",
    text: `Tu código de recuperacion es: ${code}`,
  });

  res.json({ message: "Código enviado al correo" });
});

router.post("/reset-password", async (req, res) => {
  const { email, code, password } = req.body;

  try {
    const codeRef = db.collection("recovery").doc(email);
    const codeSnapshot = await codeRef.get();

    if (!codeSnapshot.exists) {
      return res.status(400).json({ error: "Código no encontrado o expirado" });
    }

    const storedCode = codeSnapshot.data();
    const createdAt = storedCode.createdAt.toDate();
    const now = new Date();
    const expirationTime = 5 * 60 * 1000;

    if (now - createdAt > expirationTime) {
      await codeRef.delete();
      return res.status(401).json({ error: "Código expirado" });
    }

    if (storedCode.code !== code) {
      return res.status(401).json({ error: "Código incorrecto" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const usersRef = db.collection("WPUsers");
    const snapshot = await usersRef.where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    snapshot.forEach(async (doc) => {
      await doc.ref.update({
        password: hashedPassword,
      });
    });

    await codeRef.delete();

    res.json({ message: "Contraseña actualizada" });
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error);
    res.status(500).json({ error: "Error al restablecer la contraseña" });
  }
});

module.exports = router;
