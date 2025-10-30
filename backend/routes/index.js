var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', async (req, res) => {
  res.json({ message: 'API is working properly' });
});

module.exports = router;
