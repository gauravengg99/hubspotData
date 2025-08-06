const hubspot = require('@hubspot/api-client');
exports.main = async (event, callback) => {
  const hubspotClient = new hubspot.Client({
    accessToken: process.env.HUBSPOT_API_KEY 
  });
 try{ 
  const now = new Date();
const month = String(now.getMonth() + 1).padStart(2, '0');
 // const deal = event.inputFields['dealname'];
 const searchResponse = await hubspotClient.crm.deals.searchApi.doSearch({
      filterGroups: [
        {
          filters: [
            {
              propertyName: 'gere_counter',
              operator: 'HAS_PROPERTY'
            }
          ]
        }
      ],
      sorts: [
        {
          propertyName: 'gere_counter',
          direction: 'DESCENDING'
        }
      ],
      properties: ['gere_counter'],
      limit: 1
    });

    let newCounter = 1; 
    if (searchResponse.results.length > 0) {
      const highestCounter = parseInt(searchResponse.results[0].properties.gere_counter, 10);
      if (!isNaN(highestCounter)) {
        newCounter = highestCounter + 1;
      }
    }
 const dealId = event.object.objectId;
    const currentYear = new Date().getFullYear();
    const formattedCounter = `GERE-${month}${newCounter.toString().padStart(2, '0')}-${currentYear}`;
  
  await hubspotClient.crm.deals.basicApi.update(dealId, {
      properties: {
        gere_counter: newCounter,// Optional: store formatted ID
        dealname: formattedCounter // Set the deal name to GERE-XX-XXXX-XXXX
      }
    });
  
  callback({
    outputFields: {
      dealname: formattedCounter
    }
  });
   } catch (error) {
    console.error('Error in custom code:', error);
    throw error;
  }
}