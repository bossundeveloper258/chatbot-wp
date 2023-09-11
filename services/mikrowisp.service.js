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

async function getServiceByUserDocument (documentNumber)  {
    return await instaceMikrowisp.get(`/services/search?documentNumber=${documentNumber}`).then(response => {
        const data = response.data;
        return data;
    });
};

async function getUserDetailByDocument(documentNumber) {
    return await instaceMikrowisp.get(`/users/user-detail?documentNumber=${documentNumber}`).then(response => {
        const data = response.data;
        return data;
    });
}

async function getPrincipalOption ()  {
    return await instaceMikrowisp.get(`/parameter-details/search?parameterId=${parameterPrincipalOption}`).then(response => {
        const data = response.data;
        return data;
    });
};

async function getLastInvoiceByCustomer(documentNumber, userId){
    return await instaceMikrowisp.get(`/invoices/last-invoice?documentNumber=${documentNumber}&userId=${userId}&state=no pagado`).then(response => {
        const data = response.data;
        return data;
    })
}

async function postPaymentPromise (command) {
    return await instaceMikrowisp.post('/payment-promises', command, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }}).then(response => {
        const data = response.data;
        return data;
    });
}

module.exports = {
    getKeyword,
    getInformationTitular,
    getUserByDocument,
    getLastInvoiceByCustomer,
    getServiceByUserDocument,
    getUserDetailByDocument,
    postPaymentPromise
};