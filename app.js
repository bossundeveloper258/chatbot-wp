const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const MetaProvider = require('@bot-whatsapp/provider/meta')
const MockAdapter = require('@bot-whatsapp/database/mock');

const { getUserByDocument } = require("./services/mikrowisp.service");

/**
 * Aqui declaramos los flujos hijos, los flujos se declaran de atras para adelante, es decir que si tienes un flujo de este tipo:
 *
 *          Menu Principal
 *           - SubMenu 1
 *             - Submenu 1.1
 *           - Submenu 2
 *             - Submenu 2.1
 *
 * Primero declaras los submenus 1.1 y 2.1, luego el 1 y 2 y al final el principal.
 */

const getUser = async (documentNumber) => {
    return await getUserByDocument(documentNumber).then((response) => {
      return response.data;
    });
  };
  
  //Flujos
  
  const flowPagoYape = addKeyword("1")
    .addAnswer(
      "Ingrese Monto de Yapeo",
      { capture: true },
      (ctx, { flowDynamic,fallBack }) => {
        if (isNaN(ctx.body)) return fallBack();
        // return flowDynamic([{body: "continua"}])
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
  
  const flowRepotarPago = addKeyword(["1"])
    .addAnswer(
      "Para reportar tu pago por favor indicanos el medio de pago utilizado",
      null,
      null,
      []
    )
    .addAnswer(
      [
        "1- PAGO CON YAPE",
        "2- PAGO KASNET",
        "3- PAGOS CC. BCP",
        "4- PAGOS CC BANCO NACION",
      ],
      null,
      null,
      [flowPagoYape]
    );
  
  const flowPrincipal = addKeyword([
    "Hola",
    "Buenos dias",
    "Buenas tardes",
    "Buenas noches",
  ])
    .addAnswer(
      "Gracias por comunicarte con el área de facturación de AIRWIZ PERÚ"
    )
    .addAnswer(
      "Por favor ingrese el número de DNI del titular del servicio",
      { capture: true },
      async (ctx, { flowDynamic, fallBack }) => {
        if (ctx.body.length != 8) return fallBack();
        else {
          const result = await getUser(ctx.body);
          if (result.length > 0) {
            return await flowDynamic([
              {
                body: `Hola ${result[0].name} por favor selecciona una de las opciones siguientes para tu atención`,
              },
            ]);
          } else return fallBack();
        }
      }
    )
    .addAnswer(
      [
        "1. Reportar Pago",
        "2. Conocer el monto de mi deuda a la fecha",
        "3. Donde puedo hacer el pago del servicio",
      ],
      { capture: true },
      async (ctx, { flowDynamic, fallBack }) => {},
      [flowRepotarPago]
    );

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal])

    const adapterProvider = createProvider(MetaProvider, {
        jwtToken: 'EAACbK7Q2cwABO6ZAWDr2QTeXeVavSZCtZANvneQxytTsem95TQj2eFaZCAMaIMPhdcl8ue1eKZBuma1iBXnSh8OimEe8CMqxmDGZBSHGsPudOZAvrmWPsoMSHEj3j3pGbRMDDcXiP4eCi1Ear3OmJySiYSsKP6z0W8np1O7yhrvfBP0ZASjUlEeylJAwEscVTKx9ggx4ZBYZCtzqpKKYhz4QQZD',
        numberId: '101049639753769',
        verifyToken: 'EDWIN',
        version: 'v16.0',
    })

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
}

main()
