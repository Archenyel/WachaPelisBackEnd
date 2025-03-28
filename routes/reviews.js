const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();
const db = admin.firestore();

router.get("/:id", async (req, res) => {
  try {
    const movieId = req.params.id;
    const movie = await db
      .collection("WPReviews")
      .where("movieId", "==", movieId)
      .get();
    if (movie.empty) {
      res.status(404).json({
        error:
          "no se encontraron revies, que raro, sera que nadie conoce esta pelicula para cinefilos, ya sabes de esos que no tienen amigos",
        id: movieId,
      });
      return;
    }
    const reviews = movie.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/newReview/:id", async (req, res) => {
  try {
    const movieId = req.params.id;
    const { review, rate, name } = req.body;

    if (!review) {
      res.status(400).json({ error: "Faltan datos" });
      return;
    }

    const newReview = {
      movieId,
      review,
      rate,
      name,
    };

    const docRef = await db.collection("WPReviews").add(newReview);
    res.status(201).json({ id: docRef.id, ...newReview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
