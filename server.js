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

// 📥 Guardar registros enviados desde el formulario
app.post('/registro', (req, res) => {
  const dataPath = path.join(__dirname, 'registros.json');
  const nuevoRegistro = req.body;

  let registros = [];
  if (fs.existsSync(dataPath)) {
    registros = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }

  registros.push(nuevoRegistro);
  fs.writeFileSync(dataPath, JSON.stringify(registros, null, 2));

  res.json({ mensaje: '✅ Registro guardado correctamente' });
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
