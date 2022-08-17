const jsonfile = require('jsonfile');
const jokeapi = require(`./jokeapi.js`);

//!https://mailchimp.com/developer/marketing/guides/create-your-first-audience/#add-a-contact-to-an-audience
//-----------------------------------Mailchimp api setup-----------------------------------
const mailchimp = require("@mailchimp/mailchimp_marketing");
const mailChimpApiKey = jsonfile.readFileSync(`${__dirname}/secret.json`).mailChimpApiKey;
mailchimp.setConfig({
    apiKey: mailChimpApiKey,
    server: "us18",
  });

exports.listId = "fc8da8e711";
exports.campaignId = "";

//-----------------------------------Mailchimp implemented functions-----------------------------------
exports.addContactMember = (subscribingUser) => {
    return new Promise(async (resolve, reject) => {
        let response = undefined;
        try {  
          response = await mailchimp.lists.addListMember(this.listId, {
              email_address: subscribingUser.email,
              status: "subscribed",
              merge_fields: {
                FNAME: subscribingUser.firstName,
                LNAME: subscribingUser.lastName
              }
          }); 
        }
        catch (error) {
           console.log(error);
           reject(`failure.html`);
           return;
        }; 
      
        console.log(response);
        (response.status == "subscribed") ?  resolve(`success.html`)
        : reject(`failure.html`);
    });
}
  
exports.pingMailChimpServer = async () => {
    const response = await mailchimp.ping.get();
    console.log(response);
}
  
exports.createCampaign = async () => {
    const response = await mailchimp.campaigns.create({ 
                              type: "plaintext" , 
                              recipients: { 
                                  list_id : this.listId  
                              },
                              settings: {
                                 subject_line: "Joke of the day",
                                 title: "Joke of the day",
                                 from_name: "Syadon",
                                 reply_to: "bokagabor4@gmail.com"
                              }
                              });
                  
    console.log(response);
    return await response.id;
}
  
exports.listCampaigns = async () => {
    const response = await mailchimp.campaigns.list({fields:  ["campaigns.id"]});
    return await response.campaigns;
}

exports.setCampaignContent = (joke) => {
    this.queryCampaignId().then(async () => {
        const response = await mailchimp.campaigns.setContent(this.campaignId, {plain_text: joke});
        console.log(response);
    })
    .catch((error) => {
        console.log(error);
    }); 
}

exports.sendCampaign = () => {
    this.queryCampaignId().then(async () => {
        const response = await mailchimp.campaigns.send(this.campaignId);
        console.log(response);
    })
    .catch((error) => {
        console.log(error);
    }); 
}
  
exports.deleteCampaign = () => {
    this.queryCampaignId().then(async () => {
        const response = await mailchimp.campaigns.remove(this.campaignId);
        console.log(response);
    })
    .catch((error) => {
        console.log(error);
    }); 
}

exports.setupAndSendCampaign = () => {
    this.queryCampaignId().then(async () => {
      console.log(`Campaign id is: ${this.campaignId}`);
      jokeapi.getJoke()
      .then((joke) => {
        console.log(joke);
        this.setCampaignContent(joke); 
        this.sendCampaign()
      })
      .catch((error) => {
        console.log(error);
      });
    })
    .catch((error) => {
        console.log(error);
    }); 
}

exports.queryCampaignId = () => {
    return new Promise ((resolve, reject) => {
        this.listCampaigns()
        .then((campaignIds) => {
        if(campaignIds.length > 0) {
            this.campaignId = campaignIds[0].id;
            resolve(true);
        }
        else {
            reject(false);
        }
        })
        .catch((error) => {
            console.log(error);
    })});
}

/*async function getListMemberEmails()  {   //filter csak e-mail info lekérdezésére fields: ["members.email_address"]
const response = await mailchimp.lists.getListMembersInfo(listId, {fields: ["members.email_address"]});
return await response.members;
}; */