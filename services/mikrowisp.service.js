const instaceMikrowisp = require('../config/axios/mikrowisp');

const parameterKeyword = 1;
const parameterInformationTitular = 3;
const parameterPrincipalOption = 4;

async function getKeyword ()  {
    return await instaceMikrowisp.get(`/parameter-details/search?parameterId=${parameterKeyword}`).then(response => {
        const data = response.data;
        return data;
    });
};

async function getInformationTitular ()  {
    return await instaceMikrowisp.get(`/parameter-details/search?parameterId=${parameterInformationTitular}`).then(response => {
        const data = response.data;
        return data;
    });
};

async function getUserByDocument (documentNumber)  {
    return await instaceMikrowisp.get(`/users/search?documentNumber=${documentNumber}`).then(response => {
        const data = response.data;
        return data;
    });
};

async function getPrincipalOption ()  {
    return await instaceMikrowisp.get(`/parameter-details/search?parameterId=${parameterPrincipalOption}`).then(response => {
        const data = response.data;
        return data;
    });
};

module.exports = {
    getKeyword,
    getInformationTitular,
    getUserByDocument
};