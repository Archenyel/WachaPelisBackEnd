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

router.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. Obtener las reviews del usuario
    const reviewsSnapshot = await db
      .collection("WPReviews")
      .where("userId", "==", userId)
      .get();

    if (reviewsSnapshot.empty) {
      return res.status(404).json({
        error: "No hay reviews",
        id: userId,
      });
    }

    // 2. Procesar reviews y obtener datos de películas
    const reviews = await Promise.all(
      reviewsSnapshot.docs.map(async (doc) => {
        const reviewData = doc.data();

        // 3. Obtener información de la película relacionada
        let movieData = {};
        if (reviewData.movieId) {
          const movieDoc = await db
            .collection("WPMovies")
            .doc(reviewData.movieId)
            .get();
          if (movieDoc.exists) {
            movieData = movieDoc.data();
          }
        }

        return {
          id: doc.id,
          ...reviewData,
          movie: movieData, // Añadimos los datos de la película
        };
      })
    );

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const reviewId = req.params.id;
    const reviewRef = db.collection("WPReviews").doc(reviewId);
    await reviewRef.delete();
    res.status(200).json({ message: "Review eliminada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/newReview/:id", async (req, res) => {
  try {
    const movieId = req.params.id;
    const { review, rate, name, userId } = req.body;

    if (!review) {
      res.status(400).json({ error: "Faltan datos" });
      return;
    }

    const newReview = {
      movieId,
      review,
      rate,
      name,
      userId,
    };

    const docRef = await db.collection("WPReviews").add(newReview);
    res.status(201).json({ id: docRef.id, ...newReview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
