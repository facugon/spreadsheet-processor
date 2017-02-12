var express = require('express');
var router = express.Router();
var XLSX = require('xlsx');
var multer = require('multer');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('parser', { title: 'XLS Parser' });
});

/* GET users listing. */
var upload = multer({ dest: 'uploads/' });
router.post('/', upload.single('spreadsheet'), function(req, res, next) {
  res.render('parser/result', { title: 'XLS Parser' });

  console.log(req.spreadsheet);

  var workbook = XLSX.readFile('test.xlsx');
});

module.exports = router;
