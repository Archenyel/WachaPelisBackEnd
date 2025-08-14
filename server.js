const express = require("express");
const admin = require("firebase-admin");
const { Storage } = require("@google-cloud/storage");
const multer = require("multer");
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

const bucketName = "archivos-uteq-2025";
const keyFilename = "../claves/uteq-465920-b0768567d841.json"; // Asegúrate de que esta ruta sea correcta
const projectId = "uteq-465920";

const storage = new Storage({
  keyFilename: keyFilename,
  projectId: projectId,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Limita el tamaño a 5MB
  },
});

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No se ha subido ningún archivo.");
  }

  const fileName = Date.now() + "-" + req.file.originalname;
  const blob = storage.bucket(bucketName).file(fileName);
  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: req.file.mimetype,
    },
    public: true, // <-- Esta es la clave
  });

  blobStream.on("error", (err) => {
    res.status(500).send({ error: err.message });
  });

  blobStream.on("finish", () => {
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    res.status(200).send({
      message: "Archivo subido con éxito.",
      fileName: fileName,
      publicUrl: publicUrl,
    });
  });

  blobStream.end(req.file.buffer);
});

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
