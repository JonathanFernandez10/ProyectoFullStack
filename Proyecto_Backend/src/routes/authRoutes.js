const express = require('express'); 
const router = express.Router();
const { verificarToken } = require('../middleware/middleware.js');

const { 
    login, 
    refreshToken,
    logout
} = require('../controllers/authController'); 



// Ruta login 
router.post('/login', login); 
router.post('/refresh-token', refreshToken);
router.post('/logout', verificarToken, logout);

module.exports = router;