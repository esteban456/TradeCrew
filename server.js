// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Middleware para procesar JSON
app.use(express.json());
app.use(express.static(__dirname));

// 💻 IPs permitidas (tu IP pública + IPs locales)
const allowedIPs = [
  '::1',               // IPv6 local
  '127.0.0.1',         // IPv4 local
  '190.60.47.171'      // 🌐 Tu IP pública
];

app.post('/registrar', (req, res) => {
  const dataPath = path.join(__dirname, 'registros.json');

  // Destructuramos los campos para asegurar que todos existan
  const { nombre, correo, edad, numero } = req.body;
  const nuevoRegistro = { nombre, correo, edad, numero };

  // Cargar registros anteriores
  let registros = [];
  if (fs.existsSync(dataPath)) {
    try {
      registros = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (err) {
      console.error('Error leyendo registros:', err);
    }
  }

  // Agregar el nuevo registro
  registros.push(nuevoRegistro);

  // Guardar de nuevo en el archivo
  fs.writeFileSync(dataPath, JSON.stringify(registros, null, 2));

  console.log('✅ Nuevo registro guardado:', nuevoRegistro);
  res.json({ mensaje: 'Registro guardado correctamente' });
});

// 🔒 Ruta protegida solo para IPs permitidas
app.get('/admin-data', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`🕵️ Intento de acceso desde: ${ip}`);

  // Permitir acceso si la IP está en la lista o contiene coincidencia
  if (!allowedIPs.some(allowed => ip.includes(allowed))) {
    return res.status(403).send('❌ Acceso denegado. No autorizado.');
  }

  const dataPath = path.join(__dirname, 'registros.json');
  if (!fs.existsSync(dataPath)) return res.json([]);

  const registros = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  res.json(registros);
});

// Servidor activo
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  console.log('✅ IPs con acceso autorizado:', allowedIPs);
});
