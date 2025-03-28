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
    const { name, description, idUser } = req.body;
    if (!name || !description) {
      res.status(400).json({ error: "Faltan datos" });
      return;
    }
    const newList = {
      idUser,
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
    console.log(id);
    const listRef = db.collection("WPLists").where("idUser", "==", id);
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

module.exports = router;
