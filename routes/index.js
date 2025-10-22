const express = require('express')
const { fetchProfile } = require('../controllers/profileController')
const { handelStringAnalysis, handleFetchString, handleFilterStrings, handleNaturalLanguageFilter, handleDeleteString, getBase } = require('../controllers/stringController')
const router = express.Router()


//GET profile
router.get('/me', fetchProfile)
router.post('/strings', handelStringAnalysis)
router.get('/strings', handleFilterStrings)
router.get('/strings/:string_value', handleFetchString)
router.get("/strings/filter-by-natural-language", handleNaturalLanguageFilter)
router.delete("/strings/:string_value", handleDeleteString)
router.get("/strings/test", getBase)


module.exports = router