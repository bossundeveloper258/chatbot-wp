const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const MetaProvider = require('@bot-whatsapp/provider/meta')
const MockAdapter = require('@bot-whatsapp/database/mock');

const { getUserByDocument } = require("./services/mikrowisp.service");

const { reportarPago } = require("./config/config");

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
              {
                body: `Hola ${result[0].name}`,
              },
            ]);
          } else return fallBack();
        }
      }
    )
    .addAnswer(
        ["Por favor selecciona una de las opciones siguientes para tu atención"],
        { buttons: [ { body: 'Reportar Pago'}]},
        null
    );

const flowOptionReportarPago = addKeyword( ["Reportar Pago"] )
    .addAnswer(
        ["Para reportar tu pago por favor indicanos el medio de pago utilizado"],
        {
            buttons: [
                {body: "PAGO CON YAPE"},
                {body: "PAGO KASNET"},
                {body: "PAGOS CC. BCP"},
                {body: "PAGOS CC BANCO NACION"}
            ]
        }
    );

const flowFormulario = addKeyword(['Hola','⬅️ Volver al Inicio'])
    .addAnswer(
        ['Hola!','Para enviar el formulario necesito unos datos...' ,'Escriba su *Nombre*'],
        { capture: true, buttons: [{ body: '❌ Cancelar solicitud' },{body: reportarPago}] },

        async (ctx, { flowDynamic, endFlow }) => {
            if (ctx.body == '❌ Cancelar solicitud')
             return endFlow({body: '❌ Su solicitud ha sido cancelada ❌',    // Aquí terminamos el flow si la condicion se comple
                 buttons:[{body:'⬅️ Volver al Inicio' }]                      // Y además, añadimos un botón por si necesitas derivarlo a otro flow

            
            })
            nombre = ctx.body
            return flowDynamic(`Encantado *${nombre}*, continuamos...`)
        }
    )
    .addAnswer(
        ['También necesito tus dos apellidos'],
        { capture: true, buttons: [{ body: '❌ Cancelar solicitud' }] },

        async (ctx, { flowDynamic, endFlow }) => {
            if (ctx.body == '❌ Cancelar solicitud') 
                return endFlow({body: '❌ Su solicitud ha sido cancelada ❌',
                    buttons:[{body:'⬅️ Volver al Inicio' }]


        })
        apellidos = ctx.body
        return flowDynamic(`Perfecto *${nombre}*, por último...`)
        }
    )
    .addAnswer(
        ['Dejeme su número de teléfono y le llamaré lo antes posible.'],
        { capture: true, buttons: [{ body: '❌ Cancelar solicitud' }] },

        async (ctx, { flowDynamic, endFlow }) => {
            if (ctx.body == '❌ Cancelar solicitud') 
                return endFlow({body: '❌ Su solicitud ha sido cancelada ❌',
                      buttons:[{body:'⬅️ Volver al Inicio' }]
                })


                telefono = ctx.body
                await delay(2000)
                return flowDynamic(`Estupendo *${nombre}*! te dejo el resumen de tu formulario
                \n- Nombre y apellidos: *${nombre} ${apellidos}*
                \n- Telefono: *${telefono}*`)
        }
    )

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
