var express = require('express');
var router = express.Router();
var XLSX = require('xlsx');
var multer = require('multer');
var moment = require('moment');

var debug = require('debug')('eli:parser');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('parser', { title: 'XLS Parser' });
});

/* GET users listing. */
var upload = multer({ dest: 'uploads' });
router.post('/', upload.single('spreadsheet'), function(req, res, next) {

  if (req.file) {
    var file = req.file;
    debug(file);

    var workbook = XLSX.readFile(file.path);
    parseWorkbook(workbook,'ventas');
  }

  res.render('parser/result', { title: 'XLS Parser' });
});

module.exports = router;

/**
var cols = {
  'A' : {
    name: 'fecha comprobante',
    size: 8,
    validators: [
      (value) => {
        return moment(value,'YYYYMMDD').isValid();
      }
    ],
    filters: []
  } ,
  'B' : {
    name: 'tipo comprobante',
    size: 3,
    validators: [
      (value) => {
        return ['001','002','003'].indexOf(value) !== -1 ;
      }
    ] ,
    filters: []
  } ,
  'C' : { name: ''                                   , size: 0 , validators: [] , filters: [] } ,
  'D' : { name: 'punto de venta'                     , size: 5 , validators: [] , filters: [] } ,
  'E' : { name: 'numero comprobante'                 , size: 20, validators: [] , filters: [] } ,
  'F' : { name: 'numero de desp import'              , size: 16, validators: [] , filters: [] } ,
  'G' : {
    name: 'codigo doc vendedor',
    type: 'string',
    size: 2,
    validators: [
      (value) => {
        return ['80','96'].indexOf(value) !== -1 ;
      }
    ] ,
    filters: []
  } ,
  'H' : { name: 'numero ident vendedor'              , size: 20, validators: [] , filters: [] } ,
  'I' : { name: 'apellido y nombre vendedor'         , size: 30, validators: [] , filters: [] } ,
  'J' : { name: 'importe total operacion'            , size: 15, validators: [] , filters: [] } ,
  'K' : { name: 'importe total conc no gravados'     , size: 15, validators: [] , filters: [] } ,
  'L' : { name: 'importe operaciones exentas'        , size: 15, validators: [] , filters: [] } ,
  'M' : { name: 'importe perc/p a cta iva'           , size: 15, validators: [] , filters: [] } ,
  'N' : { name: 'importe perc/p a cta otros imp nac' , size: 15, validators: [] , filters: [] } ,
  'O' : { name: 'importe prec iibb'                  , size: 15, validators: [] , filters: [] } ,
  'P' : { name: 'importe prec imp munic'             , size: 15, validators: [] , filters: [] } ,
  'P' : { name: 'importe imp internos'               , size: 15, validators: [] , filters: [] } ,
  'Q' : {
    name: 'codigo de moneda',
    type: 'string',
    size: 3,
    validators: [
      (value) => {
        return ['DOL','PES'].indexOf(value) !== -1 ;
      }
    ] ,
    filters: []
  } ,
  'R' : { name: 'tipo de cambio'                     , size: 10, validators: [] , filters: [] } ,
  'S' : { name: 'cantidad de alicuotas iva'          , size: 1 , validators: [] , filters: [] } ,
  'T' : {
    name: 'codigo de operacion',
    type: 'string',
    size: 1,
    validators: [
      (value) => {
        return ['0','A','X','Z','E'].indexOf(value) !== -1 ;
      }
    ],
    filters: [ ]
  } ,
  'U' : { name: 'credito fiscal computable'          , size: 15, validators: [] , filters: [] } ,
  'V' : { name: 'otros tributos'                     , size: 15, validators: [] , filters: [] } ,
  'Y' : { name: 'cuit emisor/corredor'               , size: 11, validators: [] , filters: [] } ,
  'Z' : { name: 'denominacion emisor/corredor'       , size: 11, validators: [] , filters: [] } ,
  'AA' : { name: 'iva comision'                      , size: 11, validators: [] , filters: [] } ,
};
*/

var tiposComprobante = [
  { name : /factura a/i, code: '001' },
  { name : /factura b/i, code: '006' },
  { name : /factura e/i, code: '019' },
  { name : /nota de débito a/i, code: '002' },
  { name : /nota de débito b/i, code: '007' },
  { name : /nota de débito e/i, code: '020' },
  { name : /nota crédito a/i, code: '003' },
  { name : /nota crédito b/i, code: '008' },
  { name : /nota crédito e/i, code: '021' },
];

var tiposPercepciones = [
  { name: /^iibb/i, code: 'iibb' },
  { name: /^lhsj/i, code: 'iibb' },
  { name: /^iva/i, code: 'iva' },
];

var format = {
  ventas: {
    input: {
      A:{ name:'fecha', size: 8, filters: [], validators: [
        (value) => {
          return moment(value,'DD/MM/YYYY').isValid();
        }
      ], }, // transformarla en YYYYMMDD
      B:{ name:'tipo', size: null, filters: [], validators: [] },
      C:{ name:'numero', size: 13, filters: [], validators: [] },
      D:{ name:'nombre cliente', size: null , filters: [], validators: [] }, // numero variable de caracteres de entrada 
      E:{ name:'cuit cliente', size: 13, filters: [], validators: [] }, // un cuit valido
      F:{ name:'alicuota iva', size: null, filters: [], validators: [] },
      G:{ name:'neto', size: null, filters: [], validators: [] }, // numero de punto flotante
      H:{ name:'impuesto', size: null, filters: [], validators: [] }, // numero de punto flotante
      I:{ name:'importe exento', size: null, filters: [], validators: [] }, // numero de punto flotante
      J:{ name:'tipo de percepcion', size: null, filters: [], validators: [] }, // texto que incluye iibb o iva
      K:{ name:'importe de percepcion', size: null, filters: [], validators: [] }, // numero de punto flotante
      L:{ name:'total', size: null, filters: [], validators: [] }, // numero de punto flotante, tiene que ser igual a la suma de L = (G + H + I + K)
      M:{ name:'codigo documento comprador', size: null, filters: [], validators: [] },
      N:{ name:'codigo de moneda', size: 3, filters: [], validators: [] },
      O:{ name:'tipo de cambio', size: 10, filters: [], validators: [] },
      P:{ name:'cantidad de alicuotas de iva', size: 1, filters: [], validators: [] },
      Q:{ name:'codigo de oepracion', size: 1, filters: [], validators: [] },
    },
    output: [
      { name: 'fecha', source: 'A', size: 8, tranform: [
        (value) => {
          return moment(value).format('YYYYMMDD');
        }
      ] },
      { name: 'tipo de comprobante', source: 'B', size: 3, tranform: [
        (value) => {
          // convertir tipo de comprobante en texto de 3 caracteres
          //var tiposComprobante
        }
      ] },
      { name: 'punto de venta', source: 'C', size: 5, tranform: [
        // separar en dos por el guion, transformar en punto de venta (los primeros cuatro)
      ] },
      { name: 'numero de comprobante', source: 'C', size: 20, tranform: [
        // separar en dos por el guion, transformar en numero de comprobante (los ultimos 8)
      ] },
      { name: 'numero de comprobante hasta', source: 'C', size: 20, tranform: [
        // separar en dos por el guion, transformar en numero de comprobante (los ultimos 8)
      ] },
      { name: 'codigo documento comprador', source: 'M', size: 2, tranform: [ ] },
      { name: 'numero de identificacion de comprador', source: 'E', size: 20, tranform: [ ] },
      { name: 'nombre de comprador', source: 'D', size: 30, tranform: [ ] },
      /* 09 */{ name: 'total operacion', source: 'L', size: 15, tranform: [ ] }, // 13 + 2 , 13 digitos y 2 decimales , sin el punto
      /* 10 */{ name: 'no esta', source: null, size: 15, tranform: [ ] }, // 13 + 2  
      /* 11 */{ name: 'no esta', source: null, size: 15, tranform: [ ] }, // 13 + 2 
      { name: 'importe exento', source: 'I', size: 15, tranform: [ ] }, // 13 + 2 
      { name: 'percepcion de iva', source: 'K', size: 15, tranform: [
        // siempre que tipo de percepcion sea IVA , sino ceros
      ] }, // 13 + 2
      { name: 'percepcion de iibb', source: 'K', size: 15, tranform: [
        // siempre que tipo de percepcion sea IIBB , sino ceros
      ] }, // 13 + 2 
      /* 15 */{ name: 'no esta', source: null, size: 15, tranform: [ ] }, // todo 0
      /* 16 */{ name: 'no esta', source: null, size: 15, tranform: [ ] }, // todo 0
      { name: 'codigo de moneda', source: 'N', size: 3, tranform: [ ] },
      { name: 'tipo de cambio', source: 'O', size: 10, tranform: [ ] },
      { name: 'cantidad de alicuotas', source: 'P', size: 1, tranform: [ ] },
      { name: 'codigo de operacion', source: 'Q', size: 1, tranform: [ ] },
      /* 21 */{ name: 'no esta', source: null, size: 15, tranform: [ ] },
      { name: 'fecha vencimiento de pago', source: '', size: 0, tranform: [
        // fecha de comprobante , cuando es E lleva solo 00000000
      ] },
    ]
  },
  compras: {
  }
};

function parseWorkbook (workbook,type) {
  var first_sheet_name = workbook.SheetNames[0];

  /* Get worksheet */
  var worksheet = workbook.Sheets[first_sheet_name];

  for (z in worksheet) {
    /* all keys that do not begin with "!" correspond to cell addresses */
    if (z[0] !== '!') {
      console.log(z + "=" + JSON.stringify(worksheet[z].v));
    }
  }
}
