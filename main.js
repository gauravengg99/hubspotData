const hubspot = require('@hubspot/api-client');

exports.main = async (event, callback) => {
  try {
   
    const dealId = event.object.objectId;
    
    const CURRENT_COUNTER = parseInt(event.inputFields['quotation_number']);

   
    const nextCounter = isNaN(CURRENT_COUNTER) || CURRENT_COUNTER 
      ? 0
      : 0;
const currentYear = new Date().getFullYear();
   const hubspotClient = new hubspot.Client({ accessToken: process.env.HUBSPOT_API_KEY });

const searchResponse = await hubspotClient.crm.deals.searchApi.doSearch({
      filterGroups: [
        {
          filters: [
            {
              propertyName: 'counter', // Internal name of the GERE Counter property
              operator: 'HAS_PROPERTY'
            }
          ]
        }
      ],
      sorts: [
        {
          propertyName: 'counter',
          direction: 'DESCENDING'
        }
      ],
      properties: ['counter'],
      limit: 1
    });
    console.log(searchResponse)
    let counter = 1; // Starting point (GERE0501)
    if (searchResponse.results.length > 0) {
      const highestCounter = parseInt(searchResponse.total);
      if (!isNaN(highestCounter)) {
       counter = highestCounter + 1;
      }
    }
    const newCode = 'GE-RE' + '-'+ (nextCounter.toString().padStart(3, '0') + counter).toString() + '-' + currentYear;

    await hubspotClient.crm.deals.basicApi.update(dealId, {
      properties: {
        quotation_number: newCode,
        counter:counter
      }
    });

    console.log(`New Deal Name set: ${newCode}`);
    callback({
      outputFields: {
        quotation_number: newCode,
        counter:counter
      }
    });

  } catch (error) {
    console.error('Error setting Deal Name:', error.message);
    callback({
      outputFields: {
        quotation_number: 'ERROR'
      }
    });
  }
};
