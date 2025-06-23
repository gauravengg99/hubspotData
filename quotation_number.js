const hubspot = require('@hubspot/api-client');

exports.main = async (event, callback) => {
  try {
   
    const dealId = event.object.objectId;
    
    // const CURRENT_COUNTER = parseInt(event.inputFields['quotation_number']);

   
    // const nextCounter = isNaN(CURRENT_COUNTER) || CURRENT_COUNTER 
    //   ? 0
    //   : 0;
const currentYear = new Date().getFullYear();
   const hubspotClient = new hubspot.Client({ accessToken: process.env.HUBSPOT_API_KEY });

  const dealResponse = await hubspotClient.crm.deals.basicApi.getById(dealId, ['hubspot_owner_id']);
    const ownerId = dealResponse.properties.hubspot_owner_id;
console.log('ownerId',ownerId)
  let ownerInitials = 'XX'; // Default if owner or names are missing
    if (ownerId) {
      try {
        const ownerResponse = await hubspotClient.crm.owners.ownersApi.getById(ownerId);
        const firstName = ownerResponse.firstName || '';
        const lastName = ownerResponse.lastName || '';
        // Extract first letter of first and last name, uppercase
        const firstInitial = firstName.charAt(0).toUpperCase() || 'A';
        const lastInitial = lastName.charAt(0).toUpperCase() || 'P';
        ownerInitials = `${firstInitial}${lastInitial}`;
      } catch (error) {
        console.error('Error fetching owner details:', error);
      }
    }
    
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
       counter = highestCounter ;
      }
    }
    const now = new Date();
const month = String(now.getMonth() + 1).padStart(2, '0');

    const newCode = 'GE-RE' + '-'+ ownerInitials + '-'+month+ counter.toString().padStart(2, '0')  + '-' + currentYear;

  
 

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
