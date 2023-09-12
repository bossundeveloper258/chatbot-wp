const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
const MetaProvider = require('@bot-whatsapp/provider/meta')
const MockAdapter = require('@bot-whatsapp/database/mock');
require('dotenv').config();
const moment = require('moment');
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

const { getUserByDocument, getLastInvoiceByCustomer, getServiceByUserDocument, getUserDetailByDocument , postPaymentPromise} = require("./services/mikrowisp.service");

/**
 * 
 * 
 * 

 *
 * 
 */


//Variables
var userId;
var documentNumber;
var invoiceId;
var paymentDate;
var hourPayment;
var transactionCode;
var serviceId;
var amount;
var file;
var paymentMethodName;
var buttonList = "";

const savePaymentPromise = async() => {

  let paymentDateString = paymentDate.toString().split('-');
  let hourString = hourPayment.toString().split(':');
  let dateFormat = paymentDateString[2] + "-" + paymentDateString[1] + "-" + paymentDateString[0] + "T" + hourString[0] + ":" + hourString[1] + ":00";

  const formData = new FormData();
  console.log('dateFormat', dateFormat);
  formData.append('paymentPromiseId', '0');
  formData.append('documentNumber', documentNumber.toString());
  formData.append('attentionTypeName', attentionTypeName.toString());
  formData.append('paymentMethodName', paymentMethodName.toString());
  formData.append('amount', amount.toString());
  formData.append('operationDate', dateFormat.toString());
  formData.append('transactionCode', transactionCode.toString());
  formData.append('invoiceId', '0');
  formData.append('customerId', userId.toString());
  formData.append('state', '8');
  formData.append('registerUserId', '0');
  formData.append('registerUserFullname', 'SYSTEM');

  return await postPaymentPromise(formData).then((response) => {
    return response.data;
  }).catch((err) => {
    console.log(err.message);
  });

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
    "⬅️ Volver al Inicio"
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
          buttonList = "";
          for (let index = 0; index < serviceList.length; index++) {
            buttonList += `*${index+1}.* ${serviceList[index].userId} - ${serviceList[index].addressBilling}\n`
          }
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
      { capture: true , buttons: [ { body: reportarPago},{ body: conocerMontodeuda}, { body: dondePagar} ]},
      async ( ctx, { flowDynamic , gotoFlow , endFlow }) => {
        const reporte = ctx.body;
        if( reporte == reportarPago || reporte == conocerMontodeuda){
          // await  gotoFlow( flowOptionReportarPago )

          // const result = await getLastInvoice(documentNumber);
          // if(result !== null){
          //   return await flowDynamic([{ body: buttonList} ]);
          // }else{
          //   return endFlow('No hay facturas pendientes de pago');
          // }
          return await flowDynamic([{ body: buttonList} ]);
        }
      }
);

const flowVerificarServicio = addKeyword('VERIFICAR_SERVICIOS')
  .addAction(
    async(ctx) => {

    }
  )

const flowOptionReportarPago = addKeyword( reportarPago )
    .addAnswer( "Selecciona el servicio",
      {capture: true},
      async ( ctx, {flowDynamic , fallBack , endFlow}) => {
        
        if ( isNaN( ctx.body ) ) return fallBack('Debe ingresar una opcion valida numer');
        if( serviceList.find( (m , i) => i == (Number.parseInt( ctx.body ) - 1) ) == null ) return fallBack('Debe ingresar una opcion valida array');

        userId = serviceList.find( (m , i) => i == (Number.parseInt( ctx.body ) - 1) ).userId;

        const result = await getLastInvoice(documentNumber);
        console.log( result , "getLastInvoice reportarPago" )
        if(result == null) endFlow([ { body: 'No hay facturas pendientes de pago', buttons:[{body:'⬅️ Volver al Inicio' }] }]);
      }
    )
    .addAnswer(
        [`Indicanos el medio de pago utilizado`],
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
      messages.PAGO.OPERACION,
      { capture: true },
      (ctx, { fallBack }) => {
        if (ctx.body.length == 0) return fallBack();
        else transactionCode = ctx.body;
      }
    )
    .addAnswer(
      messages.PAGO.ARCHIVO_ADJUNTO,
      { capture: true },
      (ctx, { fallBack }) => {
        if (ctx.body.length == 0) return fallBack();
        else{
          file = ctx.message.documentMessage
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
    "Selecciona el servicio",
    {capture: true},
    async (ctx, { flowDynamic, fallBack , endFlow , gotoFlow}) => {
      console.log( "conocer dueda continua" )
      if ( isNaN( ctx.body ) ) return fallBack('Debe ingresar una opcion valida numer');
      if( serviceList.find( (m , i) => i == (Number.parseInt( ctx.body ) - 1) ) == null ) return fallBack('Debe ingresar una opcion valida array');

      userId = serviceList.find( (m , i) => i == (Number.parseInt( ctx.body ) - 1) ).userId;
      await flowDynamic([ { body: "Espere unos momentos, que estamos consultando..." } ]);
      const result = await getLastInvoice(documentNumber);
      console.log( userId );
      console.log( result )
      if(result !== null){
        amount = result.amount;
        media = result.media;
        await flowDynamic([              
          {
            body: `Hola *${userName}*
            \nTe enviamos al correo el último estado de cuenta , si aún no lo viste te compartimos los detalles 👇🏼:

            \nEl monto de la deuda es: *${result.amount.toFixed(2)}*`,
            //media: result.url
          }
        ]);
        return flowDynamic('Para tu tranquilidad, paga de forma inmediata y segura desde nuestra *WEB*');
      }else{
        ''
        return endFlow([ { body: 'No hay facturas pendientes de pago', buttons:[{body:'⬅️ Volver al Inicio' }] }]);
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
