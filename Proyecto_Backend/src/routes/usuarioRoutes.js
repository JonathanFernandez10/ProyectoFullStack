const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middleware/middleware');

const{
  crearUsuario,
  getUsers,
  getUserById,
  actualizarUsuario,
  eliminarUsuario
} = require('../controllers/usuarioController');

router.use(verificarToken, verificarRol('admin'));

// POST
router.post('/', crearUsuario);

// GET TODOS
router.get('/', getUsers);

// GET POR ID
router.get('/:id', getUserById);

// PUT
router.put('/:id', actualizarUsuario);

// DELETE
router.delete('/:id', eliminarUsuario);

module.exports = router;
