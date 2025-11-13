var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', async (req, res) => {
  // #swagger.tags = ['General']
  // #swagger.description = 'API health check endpoint'
  // #swagger.responses[200] = { description: 'API is working properly' }
  res.json({ message: 'API is working properly' });
});


module.exports = router;
