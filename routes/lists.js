const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();
const db = admin.firestore();

router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("WPLists").get();

    if (snapshot.empty) {
      res.status(404).json({ error: "No se encontraron listas" });
      return;
    }

    const lists = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(lists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/newList", async (req, res) => {
  try {
    const { name, description, userId } = req.body;
    if (!name || !description) {
      res.status(400).json({ error: "Faltan datos" });
      return;
    }
    const newList = {
      userId,
      name,
      description,
    };
    const docRef = await db.collection("WPLists").add(newList);
    res.status(201).json({ id: docRef.id, ...newList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const listRef = db.collection("WPLists").where("userId", "==", id);
    const snapshot = await listRef.get();

    if (snapshot.empty) {
      res.status(404).json({ error: "No se encontraron listas" });
      return;
    }

    const lists = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(lists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/content/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("WPLists").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Lista no encontrada" });
    }

    const listData = doc.data();

    const moviesPromises = listData.movies.map(async (movieId) => {
      const movieDoc = await db.collection("WPMovies").doc(movieId).get();
      return movieDoc.exists ? { id: movieDoc.id, ...movieDoc.data() } : null;
    });

    const movies = (await Promise.all(moviesPromises)).filter(
      (movie) => movie !== null
    );

    res.status(200).json({ id: doc.id, ...listData, movies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/add/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { movieId } = req.body;

    const listRef = db.collection("WPLists").doc(id);
    const doc = await listRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Lista no encontrada" });
    }

    const listData = doc.data();
    const updatedMovies = listData.movies
      ? [...listData.movies, movieId]
      : [movieId];

    await listRef.update({ movies: updatedMovies });

    res.json({ message: "Película agregada a la lista" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/remove/:id", async (req, res) => {
  const { id } = req.params;
  const { movieId } = req.body;

  if (!movieId) {
    return res.status(400).json({ error: "El ID de la película es requerido" });
  }

  try {
    const listRef = db.collection("WPLists").doc(id);
    const doc = await listRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Lista no encontrada" });
    }

    const listData = doc.data();
    const updatedMovies = listData.movies.filter((id) => id !== movieId);

    await listRef.update({ movies: updatedMovies });

    res.json({ message: "Película eliminada de la lista" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const listRef = db.collection("WPLists").doc(id);
    const doc = await listRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Lista no encontrada" });
    }

    await listRef.delete();
    res.status(200).json({ message: "Lista eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la lista:", error);
    res.status(500).json({ error: "Error al eliminar la lista" });
  }
});

module.exports = router;
