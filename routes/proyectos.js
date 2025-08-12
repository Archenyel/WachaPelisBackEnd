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

router.get("/alumno/:idAlumno", async (req, res) => {
  const { idAlumno } = req.params;
  try {
    const snapshot = await db.collection("proyectos").where("liderProyecto", "==", idAlumno).get();
    const proyectos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(proyectos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  const { nombre, descripcion, estado, fechaInicio, fechaFin, programaId, tipo } = req.body;

  const newProject = {
    nombre,
    descripcion,
    estado,
    fechaInicio,
    fechaFin,
    programaId,
    tipo,
  };

  try {
    const docRef = await db.collection("proyectos").add(newProject);
    res.status(201).json({ id: docRef.id, ...newProject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, estado, fechaInicio, fechaFin, programaId, tipo } = req.body;

  try {
    const docRef = db.collection("proyectos").doc(id);
    
    const updateData = {
      nombre, 
      descripcion, 
      estado, 
      fechaInicio, 
      fechaFin, 
      programaId,
      tipo,
    };
    
    await docRef.update(updateData);
    
    const proyectoActualizado = {
      id,
      ...updateData
    };
    
    res.json(proyectoActualizado);
    
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

router.put("/asignarAlumno/asignar", async (req, res) => {

  const { idProyecto, idAlumno, esLider } = req.body;
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

    if (esLider) {
      await db.collection("proyectos").doc(idProyecto).update({ liderProyecto: idAlumno });
    }

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

router.get("/alumnos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const proyectoRef = db.collection("proyectos").doc(id);
    const proyectoDoc = await proyectoRef.get();

    if (!proyectoDoc.exists) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    const proyectoData = proyectoDoc.data();
    const alumnosAsignados = proyectoData.alumnos || [];

    const alumnosPromises = alumnosAsignados.map(async (alumnoId) => {
      const alumnoDoc = await db.collection("usuarios").doc(alumnoId).get();
      return { id: alumnoDoc.id, ...alumnoDoc.data() };
    });

    const alumnos = await Promise.all(alumnosPromises);
    res.json({ alumnos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;