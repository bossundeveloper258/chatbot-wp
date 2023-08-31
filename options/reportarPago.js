
const { reportarPago } = require("../config/config");
const {
    addKeyword
  } = require("@bot-whatsapp/bot");

const flowReportarPagoYape = addKeyword( reportarPago )
.addAnswer(
  "Ingrese Monto de Yapeo",
  { capture: true },
  (ctx, { flowDynamic,fallBack }) => {
    if (!isNaN(ctx.boby)) return fallBack();
  }
)
.addAnswer(
  "Ingrese Fecha y Hora de Yapeo",
  { capture: true },
  (ctx, { fallBack }) => {
    if (ctx.body.length == 0) return fallBack();
  }
)
.addAnswer(
  "Ingrese Número de Operacipon",
  { capture: true },
  (ctx, { fallBack }) => {
    if (ctx.body.length == 0) return fallBack();
  }
)
.addAnswer(
  "Por favor Adjunte Captura del Yape",
  { capture: true },
  (ctx, { fallBack }) => {
    if (ctx.body.length == 0) return fallBack();
  }
)
.addAnswer(
  "Se registro la información brindada",
  null,
  (ctx, { fallBack, endFlow }) => {
    return endFlow({
      body: "Muchas gracias en breve estaremos registrando su pago",
    });
  }
);

module.exports = flowReportarPagoYape;