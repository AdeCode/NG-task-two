const express = require('express')
const { fetchProfile } = require('../controllers/profileController')
const router = express.Router()


//GET profile
router.get('/me', fetchProfile)

module.exports = router