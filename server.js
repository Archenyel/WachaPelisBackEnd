const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const serviceAccount = require("../claves/desarrolloweb-d9056-firebase-adminsdk-fbsvc-af83eed8a5.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(cors());
app.use(express.json());

const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const movieRoutes = require("./routes/movies");
const reviewRoutes = require("./routes/reviews");
const listRoutes = require("./routes/lists");
const sseRoutes = require("./routes/sse");

app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/movies", movieRoutes);
app.use("/reviews", reviewRoutes);
app.use("/lists", listRoutes);
app.use("/sse", sseRoutes);

app.get("/", (req, res) => {
  res.send("Backend conectado a Firebase");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
