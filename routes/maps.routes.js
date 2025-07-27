const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const mapController = require('../controllers/map.controller');
const { query,body } = require('express-validator');
const axios = require('axios');

router.get('/get-coordinates',
    query('address').isString().isLength({ min: 1 }),
    authMiddleware.authUser,
    mapController.getCoordinates
);

router.get('/get-distance-time',
    query('origin').isString().isLength({ min: 3 }),
    query('destination').isString().isLength({ min: 3 }),
    authMiddleware.authUser,
    mapController.getDistanceTime
)

router.get('/get-suggestions',
    query('input').isString().isLength({ min: 3 }),
    authMiddleware.authUser,
    mapController.getAutoCompleteSuggestions
)

router.post('/route', async (req, res) => {
  try {
    const { start, end } = req.body;
    if (!start || !end || !start.lat || !start.lng || !end.lat || !end.lng) {
      return res.status(400).json({ error: 'Invalid start or end coordinates' });
    }
    const response = await axios.post(
      'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
      { coordinates: [[start.lng, start.lat], [end.lng, end.lat]] },
      { headers: { Authorization: process.env.ORS_API_KEY } }
    );
    res.json(response.data);
  } catch (err) {
    console.error('ORS proxy error:', err.message);
    res.status(500).json({ error: 'Failed to fetch route' });
  }
});



module.exports = router;