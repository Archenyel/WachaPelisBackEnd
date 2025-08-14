const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();
const db = admin.firestore();

router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("tareas").get();
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/usuario/:usuarioId", async (req, res) => {
  const { usuarioId } = req.params;

  try {
    const snapshot = await db.collection("tareas").where("estudianteAsignado", "==", usuarioId).get();
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection("tareas").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/proyecto/:proyectoId", async (req, res) => {
  const { proyectoId } = req.params;
  try {
    const snapshot = await db.collection("tareas").where("proyectoId", "==", proyectoId).get();
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/nuevaTarea", async (req, res) => {
  const { 
    titulo, 
    estudianteAsignado, 
    descripcion, 
    estado, 
    prioridad, 
    responsable, 
    progreso, 
    proyectoId, 
    comentarios 
  } = req.body;
  
  // Validación básica
  if (!titulo || !proyectoId) {
    return res.status(400).json({ 
      error: "Título y ID del proyecto son requeridos" 
    });
  }

  const newTask = { 
    titulo, 
    estudianteAsignado: estudianteAsignado || null,
    descripcion: descripcion || "", 
    estado: estado || "Por hacer", 
    prioridad: prioridad || "media", 
    responsable: responsable || "Administrador", 
    progreso: progreso || 0, 
    proyectoId,
    comentarios: comentarios || [],
    fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
  };

  try {
    const docRef = await db.collection("tareas").add(newTask);
    
    // Obtener la tarea creada con el timestamp
    const createdDoc = await docRef.get();
    const createdTask = { id: docRef.id, ...createdDoc.data() };
    
    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ...existing code...

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { 
    titulo, 
    estudianteAsignado,
    descripcion, 
    estado, 
    prioridad, 
    responsable, 
    progreso, 
    proyectoId,
    comentarios 
  } = req.body;
  
  try {
    const docRef = db.collection("tareas").doc(id);
    
    // Verificar que la tarea existe
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    const updateData = {
      titulo,
      estudianteAsignado: estudianteAsignado || null,
      descripcion,
      estado,
      prioridad,
      responsable,
      progreso,
      proyectoId,
      fechaActualizacion: admin.firestore.FieldValue.serverTimestamp()
    };

    // Solo actualizar comentarios si se proporcionan
    if (comentarios !== undefined) {
      updateData.comentarios = comentarios;
    }

    await docRef.update(updateData);
    
    // Obtener la tarea actualizada
    const updatedDoc = await docRef.get();
    const updatedTask = { id: doc.id, ...updatedDoc.data() };
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/actualizarEstado/:id", async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({ error: "Estado es requerido" });
  }

  try {
    const docRef = db.collection("tareas").doc(id);
    
    // Verificar que la tarea existe
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    await docRef.update({ 
      estado,
      fechaActualizacion: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Obtener la tarea actualizada
    const updatedDoc = await docRef.get();
    const updatedTask = { id: doc.id, ...updatedDoc.data() };
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id/firmar", async (req, res) => {
  const { id } = req.params;
  const { comentarioFirma } = req.body;
  const { firmadoPor } = req.body;

  try {
    const docRef = db.collection("tareas").doc(id);
    // Verificar que la tarea existe
    const doc = await docRef.get(); 
    if (!doc.exists) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }
    const updateData = {
      estado: "Hecho",
      firmada: true,
      fechaActualizacion: admin.firestore.FieldValue.serverTimestamp(),
      comentarioFirma,
      firmadoPor
    };
    

    await docRef.update(updateData);
    // Obtener la tarea actualizada

    const updatedDoc = await docRef.get();
    const tarea = { id: doc.id, ...updatedDoc.data() };

    res.json({ message: "Tarea firmada correctamente", tarea });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;  
  try {
    const docRef = db.collection("tareas").doc(id);
    
    // Verificar que la tarea existe
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    await docRef.delete();
    res.json({ message: "Tarea eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/archivoUrl/:id", async (req, res) => {
  const { id } = req.params;
  const { archivoUrl } = req.body;
  try {
    const docRef = db.collection("tareas").doc(id);
    await docRef.update({ archivoUrl });
    res.json({ message: "URL del archivo actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;