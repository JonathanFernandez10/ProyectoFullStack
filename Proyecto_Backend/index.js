require('dotenv').config();

const express = require('express');
const conectarDB = require('./src/config/db.js');
const cors = require('cors');
const seedAdmin = require('./src/utils/seedAdmin');

const usuarioRoutes = require('./src/routes/usuarioRoutes');
const productoRoutes = require('./src/routes/productoRoutes');
const authRoutes = require('./src/routes/authRoutes');
const categoriaRoutes = require('./src/routes/categoriaRoutes');
const proveedorRoutes = require('./src/routes/proveedorRoutes');
const inventarioRoutes = require('./src/routes/inventarioRoutes');
const movimientoRoutes = require('./src/routes/movimientoRoutes');
const ordenCompraRoutes = require('./src/routes/ordenCompraRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
// Middleware para leer JSON
app.use(express.json());

// Registrar rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/ordenes-compra', ordenCompraRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('SmartInventory API funcionando 🚀');
});

const PORT = process.env.PORT || 4000;

const iniciar = async () => {
  await conectarDB();
  await seedAdmin();

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
};

iniciar();
