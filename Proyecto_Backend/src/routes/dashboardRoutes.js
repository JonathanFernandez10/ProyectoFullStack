const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middleware/middleware');

const { getResumen } = require('../controllers/dashboardController');

router.get('/resumen', verificarToken, verificarRol('admin', 'user'), getResumen);

module.exports = router;
