const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonfile = require('jsonfile')

const https = require('https');

//Mailchimp api setup
const mailchimp = require("@mailchimp/mailchimp_marketing");
const mailChimpApiKey = jsonfile.readFileSync(__dirname + "/apikey.json").mailChimpApiKey;
mailchimp.setConfig({
    apiKey: mailChimpApiKey,
    server: "us18",
  });
const listId = "fc8da8e711";

//JokeApi api setup
const jokeApiUrl = "https://v2.jokeapi.dev/joke/Dark?";
const jokeApiParameters = {
    amount: 1
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname)); //css miatt

const server = app.listen(process.env.PORT || 8000, () => {  
    console.log(`Server is running on port ${server.address().port}.`); 
    pingMailChimpServer();
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get('/jokes', (req, res) => {
    sendMail(res);
});

app.post('/', (req, res) => {
    addContactMember({firstName: req.body.firstname, 
      lastName: req.body.lastname, 
      email: req.body.email}, res);
});

app.post('/failure', (req, res) => {
    res.redirect('/');
});


function sendMail(res) {
   getJoke()
  .then((joke) => {
      //console.log(joke);
      createCampaign(joke);
      res.send(joke);
    }) ;
}

//! Get a joke with jokeapi
function getJoke() {
  return new Promise((resolve, reject) =>  {
      https.get(`${jokeApiUrl}${Object.entries(jokeApiParameters)[0].join('=')}`, (response) => {
      console.log(response.statusCode);
      response.on('data', (data) => {       
            try {
               const joke = JSON.parse(data);
               resolve(joke);
            } 
            catch(error) {
              reject(error);
          }      
      });
  }) });
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

async function createCampaign(joke) {
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
}

/*async function getListMemberEmails()  {   //filter csak e-mail info lekérdezésére fields: ["members.email_address"]
  const response = await mailchimp.lists.getListMembersInfo(listId, {fields: ["members.email_address"]});
  return await response.members;
}; */
