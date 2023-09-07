const { dondePagar } = require("../../config/config");

const {
    addKeyword
  } = require("@bot-whatsapp/bot");

const flowDondePagar = addKeyword( dondePagar )
  .addAnswer(
      null,
      { buttons: [ { body: bancoSelectBcp},{ body: bancoSelectNacion} ]},
      null
  )