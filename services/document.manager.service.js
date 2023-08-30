const instanceDocumentManager = require("../config/axios/document.manager");

async function getKeyword ()  {
    return await instanceDocumentManager.get('/state-workflows/search').then(response => {
        console.log(response.data);
    });
};

module.exports = {
    getKeyword
};