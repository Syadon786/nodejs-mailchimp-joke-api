const jsonfile = require('jsonfile');
const jokeapi = require(`${__dirname}/jokeapi.js`);

//!https://mailchimp.com/developer/marketing/guides/create-your-first-audience/#add-a-contact-to-an-audience
//-----------------------------------Mailchimp api setup-----------------------------------
const mailchimp = require("@mailchimp/mailchimp_marketing");
const mailChimpApiKey = jsonfile.readFileSync(`${__dirname}/apikey.json`).mailChimpApiKey;
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
           reject(`${__dirname}/public/html/failure.html`);
        }; 
      
        console.log(response);
        (response.status == "subscribed") ?  resolve(`${__dirname}/public/html/success.html`)
        : reject(`${__dirname}/public/html/failure.html`);
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
  
exports.setCampaignContent = async (id, joke) => {
    const response = await mailchimp.campaigns.setContent(id, {plain_text: joke});
    console.log(response);
}
  
exports.sendCampaign = async (id) => {
    const response = await mailchimp.campaigns.send(id);
    console.log(response);
}
  
exports.deleteCampaign = async (id) => {
    const response = await mailchimp.campaigns.remove(id);
    console.log(response);
}

exports.setupAndSendCampaign = () => {
    listCampaigns()
    .then((campaignIds) => {
      if(campaignIds.length > 0) {
          this.campaignId = campaignIds[0].id;
          console.log(`Campaign id: ${this.campaignId}`);
          return jokeapi.getJoke()
      }})
      .then((joke) => {
        console.log(joke);
        setCampaignContent(this.campaignId, joke); 
        sendCampaign(this.campaignId)
      })
      .catch((error) => {
        console.log(error);
      });
}

/*async function getListMemberEmails()  {   //filter csak e-mail info lekérdezésére fields: ["members.email_address"]
const response = await mailchimp.lists.getListMembersInfo(listId, {fields: ["members.email_address"]});
return await response.members;
}; */