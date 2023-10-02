const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
const MetaProvider = require('@bot-whatsapp/provider/meta')
const MockAdapter = require('@bot-whatsapp/database/mock');
require('dotenv').config();
const moment = require('moment');
const { 
    REPORTAR_PAGO, 
    CONOCER_DUEDA, 
    dondePagar,

    MAIN_MENU,

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


// Variables Globales
var userId;
var documentNumber;
var userName;
var optionId;
var serviceList;
var serviceListOpciones;

var invoiceId;
var paymentDate;
var hourPayment;
var transactionCode;
var serviceId;
var amount;
var file;
var paymentMethodName;
var buttonList = "";

const isUserActive = () => { 
  return userId != null && documentNumber != null && userName != null ? true : false;
}

const savePaymentPromise = async() => {

  let paymentDateString = paymentDate.toString().split("-");
  let hourString = hourPayment.toString().split(":");
  let dateFormat =
    paymentDateString[2] +
    "-" +
    paymentDateString[1] +
    "-" +
    paymentDateString[0] +
    "T" +
    hourString[0] +
    ":" +
    hourString[1] +
    ":00";

  const formData = new FormData();
  formData.append("paymentPromiseId", "0");
  formData.append("documentNumber", documentNumber.toString());
  formData.append("attentionTypeName", attentionTypeName.toString());
  formData.append("paymentMethodName", paymentMethodName.toString());
  formData.append("amount", amount.toString());
  formData.append("operationDate", dateFormat.toString());
  formData.append("transactionCode", transactionCode.toString());
  formData.append("invoiceId", "0");
  formData.append("customerId", userId.toString());
  formData.append("state", "8");
  formData.append("registerUserId", "0");
  formData.append("registerUserFullname", "SYSTEM");

  /*return await postPaymentPromise(formData)
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      console.log(err.message);
    });*/

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
// {buttons: [{ body: 'Menú principal 🖥️' }]}
const flowWelcome = addKeyword(EVENTS.WELCOME)
  .addAnswer(`Disculpa, no logro comprender
  \n⚙️ Si tienes dudas sobre mi funcionamiento puedes ir al *Menú principal*`,
  {buttons: [{ body: 'Menú principal 🖥️' }]} );
  
const flowPrincipal = addKeyword([
    "hola"
  ])
  .addAnswer(
    "",
    { capture: false} ,
    async (ctx, { flowDynamic, fallBack , gotoFlow}) => {
      if( documentNumber != null ){
        return await flowDynamic([
          { body: `Hola *${userName}*` }
        ])
      }else{

      }
    }
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
          serviceListOpciones = "";
          for (let index = 0; index < serviceList.length; index++) {
            serviceListOpciones += `*${index+1}.* ${serviceList[index].userId} - ${serviceList[index].addressBilling}\n`
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
      { capture: true , buttons: [ { body: REPORTAR_PAGO},{ body: CONOCER_DUEDA}, { body: dondePagar} ]},
      async ( ctx, { flowDynamic , gotoFlow , endFlow }) => {
        const reporte = ctx.body;
        if( reporte == REPORTAR_PAGO || reporte == CONOCER_DUEDA){
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

const flowListaOpciones = addKeyword(['Menú principal 🖥️' , MAIN_MENU])
  .addAnswer( isUserActive() ? `*${userName}*, Bienvenid@ *AIRWIZ PERÚ*` : "Bienvenid@ *AIRWIZ PERÚ*"   ,
    null,
    async(ctx , {provider}) => {
      console.log( "#########" )
      const headerText = ''
      const bodyText = 'Puedes seleccionar una de las *siguientes opciones* del menú. 😄'
      const footerText = ''
      const buttonList = 'Opciones'
      const listParams = [
          {
              title: '',
              rows: [
                  {
                      id: REPORTAR_PAGO,
                      title: 'Reportar Pago',
                      description: ''
                  },
                  {
                      id: CONOCER_DUEDA,
                      title: 'Conocer Deuda',
                      description: ''
                  },
                  {
                      id: dondePagar,
                      title: 'Donde Pagar',
                      description: ''
                  }
              ]
          }
      ]
      await provider.sendList(ctx.from, headerText, bodyText, footerText, buttonList ,listParams)
    }
  )

const flowOptionReportarPago = addKeyword( REPORTAR_PAGO )
    .addAnswer( `Necesito consultar algunos datos para continuar con tu consulta. 😅`,
      {capture: true},
      async ( ctx, {flowDynamic , fallBack , endFlow}) => {
        
        if ( isNaN( ctx.body ) ) return fallBack('Debe ingresar una opcion valida numer');
        if( serviceList.find( (m , i) => i == (Number.parseInt( ctx.body ) - 1) ) == null ) return fallBack('Debe ingresar una opcion valida array');

        userId = serviceList.find( (m , i) => i == (Number.parseInt( ctx.body ) - 1) ).userId;

        const result = await getLastInvoice(documentNumber);
        console.log( result , "getLastInvoice reportarPago" )
        if(result == null) return await flowDynamic([ { body: 'No hay facturas pendientes de pago', buttons:[{body:'⬅️ Volver al Inicio' }] }]);
      }
    )
    .addAnswer(
        [`Indicanos el medio de pago utilizado`],
        { buttons: [ { body: pagoYape},{ body: pagoBCP},{ body: pagoBANCONacion} ]},
        null
        // ,
    );

const flowConocerDeuda = addKeyword( CONOCER_DUEDA )
    .addAnswer(
      `Necesito consultar algunos datos para continuar con tu consulta`,
      null,
      async (ctx, { flowDynamic, fallBack , endFlow , gotoFlow}) => {
        optionId = 2;
        console.log( "CONOCER_DUEDA" )
        if( isUserActive() ){
          console.log( "1" )
          await gotoFlow(flowVerificarUsuarioTRUE);
        }else{
          console.log( "2" )
          await gotoFlow(flowVerificarUsuarioFALSE);
        }
        console.log( "3" )
        // console.log( "conocer dueda continua" )
        // if ( isNaN( ctx.body ) ) return fallBack('Debe ingresar una opcion valida numer');
        // if( serviceList.find( (m , i) => i == (Number.parseInt( ctx.body ) - 1) ) == null ) return fallBack('Debe ingresar una opcion valida array');
  
        // userId = serviceList.find( (m , i) => i == (Number.parseInt( ctx.body ) - 1) ).userId;
        // await flowDynamic([ { body: "Espere unos momentos, que estamos consultando..." } ]);
        // const result = await getLastInvoice(documentNumber);
        // console.log( userId );
        // console.log( result )
        // if(result !== null){
        //   amount = result.amount;
        //   media = result.media;
        //   await flowDynamic([              
        //     {
        //       body: `Hola *${userName}*
        //       \nTe enviamos al correo el último estado de cuenta , si aún no lo viste te compartimos los detalles 👇🏼:
        //       \nEl monto de la deuda es: *${result.amount.toFixed(2)}*`,
        //       media: "http://internaldb.airwiz.com.pe/mikrowisp/invoices/external-last-invoice/" + result.url
        //     }
        //   ]);
        //   return flowDynamic('Para tu tranquilidad, paga de forma inmediata y segura desde nuestra *WEB*');
        // }else{
        //   return endFlow([ { body: 'No hay facturas pendientes de pago', buttons:[{body:'⬅️ Volver al Inicio' }] }]);
        // }
        
      }
    )

const flowVerificarUsuarioTRUE = addKeyword('VERIFICAR_USUARIO_TRUE')
    .addAnswer(
      `¿Quieres consultar los servicios de este documento, *${documentNumber}*?`,
      {
        capture: true,
        buttons: [
            {body: 'Sí'},
            {body: 'No'}
        ]
      },
      async (ctx, { flowDynamic, fallBack , endFlow , gotoFlow}) => {
        if( ctx.body == 'Sí' ){
          const result = await getUserDetail(documentNumber);
          serviceList = result;
          if (result.length > 0) {
            userId = result[0].userId;
            userName = result[0].name;
            serviceListOpciones = "";
            for (let index = 0; index < result.length; index++) {
              serviceListOpciones += `*${index+1})* ${result[index].userId} - ${result[index].addressBilling}\n`
            }
            gotoFlow( flowListService );
            return await flowDynamic([
              { body: `Hola *${userName}*`},
            ]);
          } else return endFlow({body: 'No tienes ningun servicio asignado a este documento'});

        }else if( ctx.body == 'No' ){
          documentNumber = null;
          userId = null;
          userName = null;
          serviceList = null;
          serviceListOpciones = "";
          // CONTINUA LA PREGUNTA
        }else{
          return await fallBack('Debes seleccionar la opcion correcta');
        }
      }
    )
    .addAnswer(
      'Por favor, ingresa el número de *DNI* del titular.',
      {capture: true},
      async (ctx, { flowDynamic, fallBack , endFlow , gotoFlow}) => {
        if ( isNaN( ctx.body ) ) return fallBack(`Disculpa, el *documento ingresado no es válido*. \n☝️ Recuerda ingresar tu número de identificación, sin puntos ni comas. (Por ejemplo, 12345678)`);
        documentNumber = ctx.body;
        const result = await getUserDetail(documentNumber);
        serviceList = result;
        if (result.length > 0) {
          userId = result[0].userId;
          userName = result[0].name;
          serviceListOpciones = "";
          for (let index = 0; index < result.length; index++) {
            serviceListOpciones += `*${index+1})* ${result[index].userId} - ${result[index].addressBilling}\n`
          }
          return await gotoFlow( flowListService );
          
        } else return endFlow({body: 'No tienes ningun servicio asignado a este documento'});
      }
    )


const flowVerificarUsuarioFALSE = addKeyword('VERIFICAR_USUARIO_FALSE')
    .addAnswer(

    )

const flowListService = addKeyword('LISTA_SERVICIOS')
  .addAnswer(
    serviceListOpciones,
    {capture: true},
    async (ctx, { flowDynamic, fallBack , endFlow , gotoFlow}) => {
        if ( isNaN( ctx.body ) ) return fallBack('Debe ingresar una opcion valida numer');
        if( serviceList.find( (m , i) => i == (Number.parseInt( ctx.body ) - 1) ) == null ) return fallBack('Debe ingresar una opcion valida array');
  
        userId = serviceList.find( (m , i) => i == (Number.parseInt( ctx.body ) - 1) ).userId;
        await flowDynamic([ { body: "Espere unos momentos, que estamos consultando..." } ]);
        const result = await getLastInvoice(documentNumber);
        if(result !== null){
          amount = result.amount;
          media = result.media;
          await flowDynamic([              
            {
              body: `Hola *${userName}*
              \nTe enviamos al correo el último estado de cuenta , si aún no lo viste te compartimos los detalles 👇🏼:
              \nEl monto de la deuda es: *${result.amount.toFixed(2)}*`,
              media: "http://internaldb.airwiz.com.pe/mikrowisp/invoices/external-last-invoice/" + result.url
            }
          ]);
          return flowDynamic('Para tu tranquilidad, paga de forma inmediata y segura desde nuestra *WEB*');
        }else{
          return endFlow([ { body: 'No hay facturas pendientes de pago', buttons:[{body:'⬅️ Volver al Inicio' }] }]);
        }
    }
  )

const flowConocerDeudaFlujo = addKeyword('REPORTAR_PAGO_FLUJO')
  .addAnswer(

  )
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
            flowWelcome,
            flowPrincipal,
            flowListaOpciones,

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
