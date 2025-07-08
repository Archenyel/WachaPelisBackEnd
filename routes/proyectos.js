const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();
const db = admin.firestore();

router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("proyectos").get();
    const proyects = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json(proyects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection("proyectos").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  const { nombre, descripcion, inicio, entrega, encargado } = req.body;

  const newProject = {
    nombre,
    descripcion,
    inicio,
    entrega,
    encargado,
  };

  try {
    const docRef = await db.collection("proyectos").add(newProject);
    res.status(201).json({ id: docRef.id, ...newProject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, inicio, entrega, encargado } = req.body;

  try {
    const docRef = db.collection("proyectos").doc(id);
    await docRef.update({ nombre, descripcion, inicio, entrega, encargado });
    res.json({ message: "Proyecto actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const docRef = db.collection("proyectos").doc(id);
    await docRef.delete();
    res.json({ message: "Proyecto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/asignarAlumno", async (req, res) => {

  const { idProyecto, idAlumno } = req.body;

  console.log(`Asignando alumno ${idAlumno} al proyecto ${idProyecto}`);
  try {
    const proyectoRef = db.collection("proyectos").doc(idProyecto);
    const proyectoDoc = await proyectoRef.get();

    if (!proyectoDoc.exists) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    const proyectoData = proyectoDoc.data();
    const alumnosAsignados = proyectoData.alumnos || [];

    if (alumnosAsignados.includes(idAlumno)) {
      return res.status(400).json({ error: "El alumno ya está asignado a este proyecto" });
    }

    alumnosAsignados.push(idAlumno);
    await proyectoRef.update({ alumnos: alumnosAsignados });

    res.json({ message: "Alumno asignado al proyecto correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/quitarAlumno", async (req, res) => {
  const { idProyecto, idAlumno } = req.body;

  try {
    const proyectoRef = db.collection("proyectos").doc(idProyecto);
    const proyectoDoc = await proyectoRef.get();

    if (!proyectoDoc.exists) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    const proyectoData = proyectoDoc.data();
    const alumnosAsignados = proyectoData.alumnos || [];

    if (!alumnosAsignados.includes(idAlumno)) {
      return res.status(400).json({ error: "El alumno no está asignado a este proyecto" });
    }

    const updatedAlumnos = alumnosAsignados.filter((alumno) => alumno !== idAlumno);
    await proyectoRef.update({ alumnos: updatedAlumnos });

    res.json({ message: "Alumno quitado del proyecto correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;