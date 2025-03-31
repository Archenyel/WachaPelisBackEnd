express = require("express");
const router = express.Router();

const comments = [
  "Esta película es increíble!",
  "No me gustó mucho, esperaba más.",
  "Los efectos especiales son impresionantes!",
  "La actuación del protagonista es genial.",
  "El final me dejó sin palabras.",
  "Podría haber sido mejor, pero estuvo bien.",
  "Una de las mejores películas del año!",
  "La historia es un poco confusa.",
  "Muy buena cinematografía y banda sonora.",
  "No entiendo por qué a la gente le gustó tanto.",
];

router.get("/comments", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendComment = () => {
    const randomComment = comments[Math.floor(Math.random() * comments.length)];
    res.write(`data: ${JSON.stringify({ comment: randomComment })}\n\n`);
  };

  const interval = setInterval(sendComment, 3000);

  req.on("close", () => {
    clearInterval(interval);
  });
});

module.exports = router;
