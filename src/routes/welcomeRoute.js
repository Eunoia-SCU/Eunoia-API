const express = require('express');
const router = new express.Router();

router.get('/welcome', (req, res, next) => {
  res.json({
    status: 'Success',
    message: 'Welcome To Eunoia',
  });
});
router.get('/', (req, res, next) => {
  res.status(200).render('index');
});

module.exports = router;
