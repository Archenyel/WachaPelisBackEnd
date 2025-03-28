const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();
const db = admin.firestore();

router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("WPUsers").get();
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
