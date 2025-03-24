const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const serviceAccount = require("../claves/desarrolloweb-d9056-firebase-adminsdk-fbsvc-af83eed8a5.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();
const SECRET_KEY = "patata";

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend conectado a Firebase");
});

app.get("/users", async (req, res) => {
  try {
    const itemsRef = db.collection("WPUsers");
    const snapshot = await itemsRef.get();
    const items = [];
    snapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    res.json(items);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//login y registro

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Busca el usuario en Firestore
    const snapshot = await db
      .collection("WPUsers")
      .where("email", "==", email)
      .get();
    if (snapshot.empty) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // Compara contraseñas hasheadas
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciales incorrectoas" });
    }

    // Genera token JWT (válido por 1 hora)
    const token = jwt.sign(
      { id: userDoc.id, email: userData.email },
      SECRET_KEY,
      { expiresIn: "2h" }
    );

    res.json({ token, user: { id: userDoc.id, name: userData.name } });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // 1. Verifica si el email ya existe
    const snapshot = await db
      .collection("WPUsers")
      .where("email", "==", email)
      .get();

    if (!snapshot.empty) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // 2. Hash de la contraseña (¡NUNCA guardes contraseñas en texto plano!)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Guarda el usuario en Firestore
    const userRef = await db.collection("WPUsers").add({
      email,
      password: hashedPassword, // Guarda el hash, no la contraseña
      name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      id: userRef.id,
      email,
      name,
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
