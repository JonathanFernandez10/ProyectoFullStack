const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middleware/middleware');

const {
    crearCategoria,
    getCategorias,
    getCategoriaById,
    actualizarCategoria,
    eliminarCategoria
} = require('../controllers/categoriaController');

router.use(verificarToken);

router.get('/', verificarRol('admin', 'user', 'guest'), getCategorias);
router.get('/:id', verificarRol('admin', 'user', 'guest'), getCategoriaById);

router.post('/', verificarRol('admin', 'user'), crearCategoria);
router.put('/:id', verificarRol('admin', 'user'), actualizarCategoria);
router.delete('/:id', verificarRol('admin', 'user'), eliminarCategoria);

module.exports = router;
