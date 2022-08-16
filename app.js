const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jsonfile = require('jsonfile')
const https = require('https');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname)); //css miatt

//Mailchimp api setup-----------------------------------
const mailchimp = require("@mailchimp/mailchimp_marketing");
const mailChimpApiKey = jsonfile.readFileSync(__dirname + "/apikey.json").mailChimpApiKey;
mailchimp.setConfig({
    apiKey: mailChimpApiKey,
    server: "us18",
  });
const listId = "fc8da8e711";
var campaignId = "";

//JokeApi api setup-----------------------------------
const jokeApiUrl = "https://v2.jokeapi.dev/joke/Dark?";
const jokeApiParameters = {
    amount: 1
};


//------------------------Start, and endpoints-----------------------------------
const server = app.listen(process.env.PORT || 8000, () => {  
    console.log(`Server is running on port ${server.address().port}.`); 
    pingMailChimpServer();
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html");
});


app.post('/', (req, res) => {
  addContactMember({firstName: req.body.firstname, 
    lastName: req.body.lastname, 
    email: req.body.email}, res);
});

app.post('/failure', (req, res) => {
  res.redirect('/');
});


//!--------------------- Test endpoint section--------------------------------------
app.get('/joke_test', (req, res) => {
    getJoke().then((joke) => {
      res.send(`<p>${joke}</p>`);
    })
});


app.get('/create_test', (req, res) => {
    createCampaign();
    res.send("Campaign created");
});

app.get('/send_test', (req, res) => {
    setupCampaign();
    res.send('Campaign message is sent.');
});

app.get('/update_test', (req, res) => {
  listCampaigns()
  .then((campaignIds) => {
    if(campaignIds.length > 0) {
        campaignId = campaignIds[0].id;
        return getJoke();
    }
    })
    .then((joke) => {
      setCampaignContent(campaignId, joke);
      res.send("Updated campaign content.");
    })
});

app.get('/delete_test', (req, res) => {
  listCampaigns()
  .then((campaignIds) => {
    if(campaignIds.length > 0) {
        campaignId = campaignIds[0].id;
        deleteCampaign(campaignId);
        res.send("Deleted campaign");
    }});
});

 app.get('/list_test', (req, res) => {
       listCampaigns()
       .then((campaignIds) => {
        if(campaignIds.length > 0) 
          res.send(campaignIds[0].id);
        else res.send("No campaign available");  
        })
});
//-----------------------------------------------------------------

function setupCampaign() {
  listCampaigns()
  .then((campaignIds) => {
    if(campaignIds.length > 0) {
        campaignId = campaignIds[0].id;
        console.log(`Campaign id: ${campaignId}`);
        return getJoke()
    }})
    .then((joke) => {
      console.log(joke);
      setCampaignContent(campaignId, joke); 
      sendCampaign(campaignId)
    })
    .catch((error) => {
      console.log(error);
    });
}

//! Get a joke with jokeapi----------------------------------------------------------------------
function getJoke() {
  return new Promise((resolve, reject) =>  {
      https.get(`${jokeApiUrl}${Object.entries(jokeApiParameters)[0].join('=')}`, (response) => {
      console.log(`Joke response status: ${response.statusCode}`);
      response.on('data', (data) => {       
            try {
               const joke_json = JSON.parse(data);
               resolve(parseJoke(joke_json));
            } 
            catch(error) {
              reject(error);
          }      
      });
  }) });
}

function parseJoke(joke_json) {
    var joke = "";
    if(joke_json.type == "twopart") {
      joke = `${joke_json.setup}\n${joke_json.delivery}`;
      return joke;
    }
    return joke_json.joke;
}

//!https://mailchimp.com/developer/marketing/guides/create-your-first-audience/#add-a-contact-to-an-audience
async function addContactMember(subscribingUser, res) {
  var response = undefined;
  try {  
    response = await mailchimp.lists.addListMember(listId, {
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
     res.sendFile(__dirname + "/failure.html");
     return;
  }; 

  console.log(response);
  (response.status == "subscribed") ?  res.sendFile(__dirname + "/success.html")
  : res.sendFile(__dirname + "/failure.html");
}

async function pingMailChimpServer() {
    const response = await mailchimp.ping.get();
    console.log(response);
}

async function createCampaign() {
  const response = await mailchimp.campaigns.create({ 
                            type: "plaintext" , 
                            recipients: { 
                                list_id : listId  
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

async function listCampaigns() {
  const response = await mailchimp.campaigns.list({fields:  ["campaigns.id"]});
  return await response.campaigns;
}

async function setCampaignContent(id, joke) {
  const response = await mailchimp.campaigns.setContent(id, {plain_text: joke});
  console.log(response);
}

async function sendCampaign(id) {
  const response = await mailchimp.campaigns.send(id);
  console.log(response);
}

async function deleteCampaign(id) {
  const response = await mailchimp.campaigns.remove(id);
  console.log(response);
}
/*async function getListMemberEmails()  {   //filter csak e-mail info lekérdezésére fields: ["members.email_address"]
  const response = await mailchimp.lists.getListMembersInfo(listId, {fields: ["members.email_address"]});
  return await response.members;
}; */
