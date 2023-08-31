const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const MetaProvider = require('@bot-whatsapp/provider/meta')
const MockAdapter = require('@bot-whatsapp/database/mock');

const { getUserByDocument } = require("./services/mikrowisp.service");

const { reportarPago , conocerMontodeuda, dondePagar} = require("./config/config");

const  flowReportarPagoYape = require("./options/reportarPago");

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
      { capture: true},
      async (ctx, { flowDynamic, fallBack }) => {
        if (ctx.body.length != 8) return fallBack();
        else {
          const result = await getUser(ctx.body);
          if (result.length > 0) {
            return await flowDynamic([
              { body: `Hola ${result[0].name}`},
            ]);
          } else return fallBack();
        }
      }
    )
    .addAnswer(
        ["Por favor selecciona una de las opciones siguientes para tu atención"],
        { buttons: [ { body: reportarPago},{ body: conocerMontodeuda}, { body: dondePagar} ]},
        null
    );

const flowOptionReportarPago = addKeyword( reportarPago )
    .addAnswer(
        ["Para reportar tu pago por favor indicanos el medio de pago utilizado"],
        { buttons: [ { body: 'PAGO YAPE'},{ body: 'PAGO KASNET'},{ body: 'PAGO BCP'},{ body: 'PAGS BANCO NACION'} ]},
        null
    );


const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow(
        [
            flowPrincipal,
            flowOptionReportarPago
        ]);

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
