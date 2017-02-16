'use strict';

const XLSX = require('xlsx');
const multer = require('multer');
const moment = require('moment');
const express = require('express');
const debug = require('debug')('eli:parser');
const format = require('util').format;

var router = express.Router();

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
    var rows = workbookIntoRows(workbook);

    validateVentas(rows);
  }

  res.status(200).send(rows);
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
  { name : 'factura a', code: '001' }, // a empresa
  { name : 'nota de débito a', code: '002' }, // a empresa
  { name : 'nota crédito a', code: '003' }, // a empresa
  { name : 'factura b', code: '006' },
  { name : 'nota de débito b', code: '007' },
  { name : 'nota crédito b', code: '008' },
  { name : 'factura e', code: '019' }, // a empresa extranjera
  { name : 'nota de débito e', code: '020' }, // a empresa extranjera
  { name : 'nota crédito e', code: '021' }, // a empresa extranjera
];

var tiposPercepciones = [
  { name: 'iibb', code: 'iibb' },
  { name: 'lhsj', code: 'iibb' },
  { name: 'iva' , code: 'iva'  },
];

function isComprobanteA (tipo) {
  return ['001','002','003'].indexOf(tipo) !== -1;
}
function isComprobanteB (tipo) {
  return ['006','007','008'].indexOf(tipo) !== -1;
}
function isComprobanteE (tipo) {
  return ['019','020','021'].indexOf(tipo) !== -1;
}

var dataFormat = {
  ventas: {
    pre: {
      A:{
        name:'fecha',
        size: 8,
        filters: [
          value => {
            return new Date((parseInt(value) - (25567 + 2))*86400*1000);
          }
        ],
        validators: [
          value => value != 'Invalid Date'
        ]
      },
      B:{
        name: 'tipo',
        size: null,
        filters: [
          (value) => tiposComprobante.find(
            (tipo) => new RegExp(tipo.name,'i').test(value)
          )
        ],
        validators: [
          (value) => value !== undefined
        ]
      },
      C:{
        name:'numero',
        size: 13,
        filters: [ ],
        validators: [
          (value,row,format) => value.length === format.size
        ]
      },
      D:{ name:'nombre cliente', size: null , filters: [], validators: [] }, // numero variable de caracteres de entrada 
      E:{
        name:'cuit cliente',
        size: 11,
        filters: [
          (value) => value.replace(/-/g,'')
        ],
        validators: [
          (value,row,format) => value.length <= format.size ,
          (value,row) => {
            var tipo = row['B'].f.code;
            if (isComprobanteA(tipo) || isComprobanteE(tipo)) {
              return value.length === 11; // CUIT
            } else if ( isComprobanteB(tipo) ) {
              return value.length === 8; // DNI
            } else {
              return false;
            }
          }
        ]
      }, // un cuit valido
      F:{
        name:'alicuota iva',
        size: null,
        filters: [
          value => parseFloat(value)
        ],
        validators: [
          (value,row) => {
            var tipo = row['B'].f.code;
            if (value === 0 && isComprobanteA(tipo)) {
              return false;
            } else {
              return true;
            }
          }
        ]
      },
      G:{
        name:'neto',
        size: null,
        filters: [
          value => Math.abs(parseFloat(value))
        ],
        validators: []
      }, // numero de punto flotante
      H:{
        name:'impuesto',
        size: null,
        filters: [
          value => Math.abs(parseFloat(value)),
          //(value,row) => {
          //  if (value !== 0) {
          //    return value;
          //  } else {
          //    return row.G.f * (row.F.f / 100);
          //  }
          //}
        ],
        validators: [
          (value,row) => {
            var tipo = row['B'].f.code;
            if (isComprobanteA(tipo) && (!value||value===0)) {
              return false;
            }
            return true;
          }
        ]
      }, // numero de punto flotante
      I:{
        name:'importe exento',
        size: null,
        filters: [
          value => Math.abs(parseFloat(value))
        ],
        validators: [
        ] 
      }, // numero de punto flotante
      J:{
        name:'tipo de percepcion',
        size: null,
        filters: [
          (value) => tiposPercepciones.find(
            (tipo) => new RegExp(tipo.name,'i').test(value)
          ),
          (value) => value || null
        ],
        validators: []
      }, // texto que incluye iibb o iva
      K:{
        name:'importe de percepcion',
        size: null,
        filters: [],
        validators: []
      }, // numero de punto flotante
      L:{
        name:'total',
        size: null,
        filters: [
          value => parseFloat(value)
        ],
        validators: [
          (value,row) => {
            return value === row.G.v + row.H.v ;
          }
        ]
      }, // numero de punto flotante, tiene que ser igual a la suma de L = (G + H + I + K)
      M:{ name:'codigo de moneda', size: 3, filters: [], validators: [] },
      N:{ name:'tipo de cambio', size: 10, filters: [], validators: [] },
      O:{ name:'cantidad de alicuotas de iva', size: 1, filters: [], validators: [] },
      P:{ name:'codigo de operacion', size: 1, filters: [], validators: [] },
    },
    post: [
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

function validateVentas (rows) {
  debug('validating rows');

  var specs = dataFormat['ventas'];
  var pre = specs.pre,
    post = specs.post;

  for (var index in rows) {
    var row = rows[index];
    if (!row) continue;
    for (var col in row) {
      var colFormat = pre[col];
      var value = (row[col].t === 'n') ? new String(row[col].v) : row[col].v;

      // pre filter
      if (colFormat.filters.length>0) {
        value = colFormat.filters.reduce((val,fn) => fn(val,row,colFormat),value);
      }

      row[col].f = value;

      // validate
      var isValid = colFormat.validators.every((fn) => fn(value,row,colFormat));
      if (!isValid) {
        var message = format('ERROR: %s is not valid in %s/%s ', value, col, index);
        debug(message);
        row[col].error = message;
      }
    }
  }
}

function workbookIntoRows (workbook) {
  var first_sheet_name = workbook.SheetNames[0];
  var worksheet = workbook.Sheets[first_sheet_name];

  var rows = [], currRow = 1;

  for (var cell in worksheet) {
    debug('reading %s',cell);
    if (cell[0] !== '!') {
      var col = cell.match(/[A-Z]+/)[0];
      var row = cell.match(/[0-9]+/)[0];
      //var val = worksheet[cell].w;

      if (parseInt(row) !== currRow) { // keep track of the row
        currRow++;
      }
      if (rows[currRow] === undefined) { // initialize
        rows[currRow] = {};
      }
      rows[currRow][col] = worksheet[cell];
    }
  }

  return rows;
}
