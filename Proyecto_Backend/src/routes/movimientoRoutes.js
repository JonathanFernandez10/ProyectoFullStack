const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middleware/middleware');

const {
    crearMovimiento,
    getMovimientos,
    getMovimientoById,
    actualizarMovimiento,
    eliminarMovimiento
} = require('../controllers/movimientoController');

router.use(verificarToken, verificarRol('admin', 'user'));

router.get('/', getMovimientos);
router.get('/:id', getMovimientoById);
router.post('/', crearMovimiento);
router.put('/:id', actualizarMovimiento);
router.delete('/:id', eliminarMovimiento);

module.exports = router;