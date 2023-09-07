
const { reportarPago , pagoYape } = require("../../config/config");


const moment = require('moment');

var invoiceId;
var paymentDate;
var transactionCode;
var file;


const {
    addKeyword
  } = require("@bot-whatsapp/bot");



module.exports = flowReportarPagoYape;