const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
//Claves para desarrollo
//const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS_JSON);
//Claves para produccion
const serviceAccount = require("../claves/firebaseClave.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(cors());
app.use(express.json());

const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tareas");
const projectRoutes = require("./routes/proyectos");
const portafoliosRoutes = require("./routes/portafolios");
const programasRoutes = require("./routes/programas");


app.use("/usuarios", userRoutes);
app.use("/auth", authRoutes);
app.use("/tareas", taskRoutes);
app.use("/proyectos", projectRoutes);
app.use("/portafolios", portafoliosRoutes);
app.use("/programas", programasRoutes);

app.get("/", (req, res) => {
  res.send("Backend conectado a Firebase");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
