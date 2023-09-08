const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
const MetaProvider = require('@bot-whatsapp/provider/meta')
const MockAdapter = require('@bot-whatsapp/database/mock');
require('dotenv').config();

const { 
    reportarPago, 
    conocerMontodeuda, 
    dondePagar,

    pagoYape,
    pagoBANCONacion,
    pagoBCP,
  
    PARGARYAPE,
    PARGARBCP,
    PARGARWEB,
  
    BCPAGENTE,
    BCPAPP,
    BCPWEB,
    BCPTELECREDITO} = require("./config/config");

const  messages  = require("./config/messages");

const { getUserByDocument, getLastInvoiceByCustomer, getServiceByUserDocument, getUserDetailByDocument } = require("./services/mikrowisp.service");

/**
 * 
 * 
 * 

 *
 * 
 */


//Variables
var userId;
var userName;
var documentNumber;
var invoiceId;
var paymentDate;
var hourPayment;
var transactionCode;
var serviceId;
var amount = 0;
var file;
var serviceList = [];

const postPaymentPromise = () => {
  console.log(userId);
  console.log(documentNumber);
  console.log(paymentDate);
  console.log(hourPayment);
  console.log(transactionCode);
  console.log(amount);
  console.log(file);
};

const getServiceByUser = async (documentNumber) => {
  return await getServiceByUserDocument(documentNumber).then((response) => {
    return response.data;
  });
};

const getUserDetail = async (documentNumber) => {
  return await getUserDetailByDocument(documentNumber).then((response) => {
    return response.data;
  });
};

const getLastInvoice = async (documentNumber) => {
  console.log(userId , "---")
  return await getLastInvoiceByCustomer(documentNumber, userId).then((response) => {
      return response.data;
  });
}

const getUser = async (documentNumber) => {
  return await getUserByDocument(documentNumber, userId).then((response) => {
    return response.data;
  });
};


/**
 * * Aqui declaramos los flujos hijos, los flujos se declaran de atras para adelante, es decir que si tienes un flujo de este tipo:
 * *
 *
============================ Flujos =============================
 *
 *
*/
  
const flowPrincipal = addKeyword([
    "Hola",
    "Buenos dias",
    "Buenas tardes",
    "Buenas noches",
  ])
  .addAnswer(
    "Gracias por comunicarte con el área de facturación de *AIRWIZ PERÚ*"
  )
  .addAnswer(
    "Por favor ingrese el número de *DNI* del titular del servicio",
    { capture: true},
    async (ctx, { flowDynamic, fallBack }) => {
      if (ctx.body.length != 8) return fallBack();
      else {
        documentNumber = ctx.body;
        const result = await getUserDetail(ctx.body);
        if (result.length > 0) {

          serviceList = result;
          userId = result[0].userId;
          userName = result[0].name;

          // await flowDynamic(services);
          return await flowDynamic([
            { body: `Hola *${userName}*`},
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
    .addAnswer("Selecciona el servicio" , 
      {
        capture: true ,
        buttons: serviceList?.map( s => { return { body: `${s.addressBilling}` } } ) ?? []
      },
      async ( ctx, {}) => {
        console.log(ctx.body)
        console.log(ctx.from)
      }
    )
    .addAnswer(
        [`*Indicanos el medio de pago utilizado*`],
        { buttons: [ { body: pagoYape},{ body: pagoBCP},{ body: pagoBANCONacion} ]},
        null
        // ,
    );

const flowReportarPagoYape = addKeyword( pagoYape )
    .addAnswer(
      messages.PAGO.MONTO,
      { capture: true },
      (ctx, { flowDynamic,fallBack }) => {
        if (!isNaN(ctx.boby)) return fallBack('Debe ingresar solo números');
        else amount = ctx.body;
      }
    )
    .addAnswer(
      messages.PAGO.FECHA,
      { capture: true },
      (ctx, { fallBack }) => {
        if (ctx.body.length == 0) return fallBack();
        else{
          let validateDate = moment(ctx.body, 'DD-MM-YYYY', true).isValid();
          if(!validateDate) return fallBack('Debe ingresar la información con el siguiente formato [DD-MM-YYYY]');
          else paymentDate = ctx.body;
        }
      }
    )
    .addAnswer(
      messages.PAGO.HORA,
      {capture: true},
      (ctx, {fallBack}) => {
        if (ctx.body.length == 0) return fallBack('Debe ingresar la hora de operación');
        else hourPayment = ctx.body;
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

  const flowSeleccionBancoBCP = addKeyword( pagoBCP )
  .addAnswer(
    messages.PAGO.MONTO,
    { capture: true },
    (ctx, { flowDynamic,fallBack }) => {
      if (!isNaN(ctx.boby)) return fallBack('Debe ingresar solo números');
      else amount = ctx.body;
    }
  )
  .addAnswer(
    messages.PAGO.FECHA,
    { capture: true },
    (ctx, { fallBack }) => {
      if (ctx.body.length == 0) return fallBack();
      else{
        let validateDate = moment(ctx.body, 'DD-MM-YYYY', true).isValid();
        if(!validateDate) return fallBack('Debe ingresar la información con el siguiente formato [DD-MM-YYYY]');
        else paymentDate = ctx.body;
      }
    }
  )
  .addAnswer(
    messages.PAGO.HORA,
    {capture: true},
    (ctx, {fallBack}) => {
      if (ctx.body.length == 0) return fallBack('Debe ingresar la hora de operación');
      else hourPayment = ctx.body;
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

const flowSeleccionBancoNacion = addKeyword( pagoBANCONacion )
  .addAnswer(
    messages.PAGO.MONTO,
    { capture: true },
    (ctx, { flowDynamic,fallBack }) => {
      if (!isNaN(ctx.boby)) return fallBack('Debe ingresar solo números');
      else amount = ctx.body;
    }
  )
  .addAnswer(
    messages.PAGO.FECHA,
    { capture: true },
    (ctx, { fallBack }) => {
      if (ctx.body.length == 0) return fallBack();
      else{
        let validateDate = moment(ctx.body, 'DD-MM-YYYY', true).isValid();
        if(!validateDate) return fallBack('Debe ingresar la información con el siguiente formato [DD-MM-YYYY]');
        else paymentDate = ctx.body;
      }
    }
  )
  .addAnswer(
    messages.PAGO.HORA,
    {capture: true},
    (ctx, {fallBack}) => {
      if (ctx.body.length == 0) return fallBack('Debe ingresar la hora de operación');
      else hourPayment = ctx.body;
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

let media = null
const flowConocerDeuda = addKeyword( conocerMontodeuda )
  .addAnswer(
    'Consultando factura, espere un momento por favor',
    {capture: false},
    async (ctx, { flowDynamic, fallBack }) => {
      console.log(documentNumber , "documentNumber")
      console.log(userId , "userId")
      const result = await getLastInvoice(documentNumber);
      console.log(result);
      amount = result.amount;
      media = result.media;
      if(result !== null){
        await flowDynamic([              
          {
            body: `Hola *${userName}*
            \nTe enviamos al correo el último estado de cuenta , si aún no lo viste te compartimos los detalles 👇🏼:

            \nEl monto de la deuda es: *${result.amount.toFixed(2)}* 

            \nPara tu tranquilidad, paga de forma inmediata y segura desde nuestra *WEB*`,
            //media: result.url
          }
        ]);
      }else{
        return fallBack('No hay facturas pendientes de pago');
      }
    }
  )


const flowDondePagar = addKeyword( dondePagar )
  .addAnswer(
    "Indicanos con cual de las siguientes opciones deseas realizar tu pago",
    { buttons: [ { body: PARGARYAPE},{ body: PARGARBCP}, { body: PARGARWEB} ]},
  )
  // .addAnswer(
  //   [
  //     "1.- YAPE",
  //     "2.- BCP",
  //     "3.- ON-LINE WEB",
  //     "4.- KASNET"
  //   ],
  //   {capture: true},
  //   (ctx, {flowDynamic, fallBack}) => {
  //     if(ctx.body.length === 0) return fallBack('Debe ingresar una de las opciones');
  //     else{
  //       console.log(ctx.body);
  //     }
  //   }
  // );

const flowYape = addKeyword( PARGARYAPE )
  .addAnswer("Aquí encontrará una imágen de como realizar el pago por yape", {
    media: 'https://www.airwiz.com.pe/wp-content/uploads/2023/06/yo-meditando-web.png',
    delay: 500,
    },
    async (ctx, {flowDynamic}) => {
      await flowDynamic([{
        body: 'https://www.tiktok.com/@airwizperu/video/7272889450462465286'
      }])
    }
  )

const flowDondePagarBCP = addKeyword( PARGARBCP )
  .addAnswer(
    "Por favor seleccionar opcion",
    { buttons: [ { body: BCPAGENTE},{ body: BCPAPP}, { body: BCPWEB} ]},
  )

const flowDondePagarBCPAGENTE = addKeyword( BCPAGENTE )
  .addAnswer("Aquí encontrará una imágen de como realizar el pago por yape", {
    media: 'https://www.airwiz.com.pe/wp-content/uploads/2023/06/yo-meditando-web.png'
  })
  .addAnswer("Aquí encontrará un video de como realizar el pago por yape", {
    media: 'https://www.tiktok.com/@airwizperu/video/7272889450462465286'
  });
const flowDondePagarBCPAPP = addKeyword( BCPAPP )
  .addAnswer("Aquí encontrará una imágen de como realizar el pago por yape", {
    media: 'https://www.airwiz.com.pe/wp-content/uploads/2023/06/yo-meditando-web.png'
  })
  .addAnswer("Aquí encontrará un video de como realizar el pago por yape", {
    media: 'https://www.tiktok.com/@airwizperu/video/7272889450462465286'
  });
const flowDondePagarBCPWEB = addKeyword( BCPWEB )
  .addAnswer("Aquí encontrará una imágen de como realizar el pago por yape", {
    media: 'https://www.airwiz.com.pe/wp-content/uploads/2023/06/yo-meditando-web.png'
  })
  .addAnswer("Aquí encontrará un video de como realizar el pago por yape", {
    media: 'https://www.tiktok.com/@airwizperu/video/7272889450462465286'
  });


const flowDondePagarPARGARWEB = addKeyword( PARGARWEB )
  .addAnswer("Aquí encontrará una imágen de como realizar el pago por yape", {
    media: 'https://www.airwiz.com.pe/wp-content/uploads/2023/06/yo-meditando-web.png'
  })
  .addAnswer("Aquí encontrará un video de como realizar el pago por yape", {
    media: 'https://www.tiktok.com/@airwizperu/video/7272889450462465286'
  });
/*
*
*
=======================================================================================================================================================
=======================================================================================================================================================
=======================================================================================================================================================
*
*/


const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow(
        [
            flowPrincipal,

            flowOptionReportarPago,

            flowReportarPagoYape,
            flowSeleccionBancoBCP,
            flowSeleccionBancoNacion,

            flowConocerDeuda,

            flowDondePagar,
            flowYape,

            flowDondePagarBCP,
            flowDondePagarBCPAGENTE,
            flowDondePagarBCPAPP,
            flowDondePagarBCPWEB,
            flowDondePagarPARGARWEB
        ]);

    const adapterProvider = createProvider(MetaProvider, {
        jwtToken: process.env.TOKEN_BOT,
        numberId: process.env.NUMBER_ID,
        verifyToken: process.env.VERIFY_TOKEN,
        version: process.env.VERSION,
    })

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
}

main()
