const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middleware/middleware');

const {
    getInventario,
    getInventarioById,
    actualizarInventario
} = require('../controllers/inventarioController');

router.use(verificarToken);

router.get('/', verificarRol('admin', 'user', 'guest'), getInventario);
router.get('/:id', verificarRol('admin', 'user', 'guest'), getInventarioById);
router.put('/:id', verificarRol('admin', 'user'), actualizarInventario);

module.exports = router;
