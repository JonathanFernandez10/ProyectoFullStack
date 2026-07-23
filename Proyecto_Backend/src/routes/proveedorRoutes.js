const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middleware/middleware');

const {
    crearProveedor,
    getProveedores,
    getProveedorById,
    actualizarProveedor,
    eliminarProveedor
} = require('../controllers/proveedorController');

router.use(verificarToken, verificarRol('admin', 'user'));

router.get('/', getProveedores);
router.get('/:id', getProveedorById);
router.post('/', crearProveedor);
router.put('/:id', actualizarProveedor);
router.delete('/:id', eliminarProveedor);

module.exports = router;