const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middleware/middleware');

const {
    crearOrdenCompra,
    getOrdenesCompra,
    getOrdenCompraById,
    actualizarOrdenCompra,
    eliminarOrdenCompra
} = require('../controllers/ordenCompraController');

router.use(verificarToken);

// admin/user ven y gestionan todas las órdenes; proveedor solo ve las suyas (filtrado en el controlador)
router.get('/', verificarRol('admin', 'user', 'proveedor'), getOrdenesCompra);
router.get('/:id', verificarRol('admin', 'user', 'proveedor'), getOrdenCompraById);

router.post('/', verificarRol('admin', 'user'), crearOrdenCompra);
router.put('/:id', verificarRol('admin', 'user'), actualizarOrdenCompra);
router.delete('/:id', verificarRol('admin', 'user'), eliminarOrdenCompra);

module.exports = router;