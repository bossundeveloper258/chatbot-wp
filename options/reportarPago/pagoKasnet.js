const { pagoKASNET } = require("../../config/config");
const moment = require('moment');

var invoiceId;
var paymentDate;
var transactionCode;
var file;

const {
    addKeyword
  } = require("@bot-whatsapp/bot");

const flowReportarPagoKasnet = addKeyword( pagoKASNET )
.addAnswer(
    messages.PAGO.MONTO,
    { capture: true },
    (ctx, { flowDynamic,fallBack }) => {
      if ( isNaN(ctx.boby) ) return fallBack( messages.ERROR.ONLY_NUMBER );
    }
  )
  .addAnswer(
    messages.PAGO.FECHA,
    { capture: true },
    (ctx, { fallBack }) => {
      if (ctx.body.length == 0) return fallBack();
      else{
        let validateDate = moment(ctx.body, 'DD-MM-YYYY HH:mm:ss', true).isValid();
        if(!validateDate) return fallBack( messages.ERROR.FORMAT_DATE );
      }
    }
  )
  .addAnswer(
    messages.PAGO.OPERACION,
    { capture: true },
    (ctx, { fallBack }) => {
      if (ctx.body.length == 0) return fallBack();
    }
  )
  .addAnswer(
    messages.PAGO.ARCHIVO_ADJUNTO,
    { capture: true },
    (ctx, { fallBack }) => {
      if (ctx.body.length == 0) return fallBack();
      else{
        console.log(ctx.message.documentMessage);
      }
    }
  )
  .addAnswer(
    messages.PAGO.SUCCESS,
    null,
    (ctx, { fallBack, endFlow }) => {
      return endFlow({
        body: messages.PAGO.GRACIAS,
      });
    }
  );

  module.exports = flowReportarPagoKasnet;