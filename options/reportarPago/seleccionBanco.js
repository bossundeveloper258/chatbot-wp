const { pagoBCP, pagoBANCONacion } = require("../../config/config");

var invoiceId;
var paymentDate;
var transactionCode;
var file;

const {
    addKeyword
  } = require("@bot-whatsapp/bot");

// const flowSeleccionBanco = addKeyword( pagoBANCO )
// .addAnswer(
//     null,
//     { buttons: [ { body: bancoSelectBcp},{ body: bancoSelectNacion} ]},
//     null
// )






module.exports = {
    flowSeleccionBancoBCP,
    flowSeleccionBancoNacion
};