const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();
const db = admin.firestore();

router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("WPMovies").get();
    const movies = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const movieId = req.params.id;
    const movie = await db.collection("WPMovies").doc(movieId).get();
    if (!movie.exists) {
      res.status(404).json({ error: "Pelicula no encontrada!" });
      return;
    }
    res.status(200).json({ ...movie.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
