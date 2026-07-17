const express = require('express');

const router = express.Router();

const { verificarToken, verificarRol } = require('../middleware/middleware');

const {
    crearProducto,
    getProductos,
    getProductoById,
    actualizarProducto,
    eliminarProducto
} = require('../controllers/productoController');

router.use(verificarToken);

router.get('/', verificarRol('admin', 'user', 'guest'), getProductos);
router.get('/:id', verificarRol('admin', 'user', 'guest'), getProductoById);

router.post('/', verificarRol('admin', 'user'), crearProducto);
router.put('/:id', verificarRol('admin', 'user'), actualizarProducto);
router.delete('/:id', verificarRol('admin', 'user'), eliminarProducto);

module.exports = router;
