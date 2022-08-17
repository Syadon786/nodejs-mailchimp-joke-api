const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jsonfile = require('jsonfile');
const adminKey = jsonfile.readFileSync(`${__dirname}/secret.json`).adminKey;
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public")); 

const mailchimp = require(`${__dirname}/mailchimp.js`);
const jokeapi = require(`${__dirname}/jokeapi.js`);


//------------------------Start, and endpoints-----------------------------------
const server = app.listen(process.env.PORT || 9000, () => {  
    console.log(`Server is running on port ${server.address().port}.`); 
});

app.get('/', (req, res) => {
     res.sendFile(`${__dirname}/public/html/index.html`);
});

app.post('/', (req, res) => {
    mailchimp.addContactMember({firstName: req.body.firstname, 
      lastName: req.body.lastname, 
      email: req.body.email})
      .then((successPath) => {
        res.sendFile(successPath);
      })
      .catch((failurePath) => {
        res.sendFile(failurePath);
      })
});

app.post('/failure', (req, res) => {
      res.redirect('/');
});


//!--------------------- Test endpoint section--------------------------------------
app.get(`/${adminKey}/joke_test`, (req, res) => {
    jokeapi.getJoke().then((joke) => {
      res.send(`<p>${joke}</p>`);
    })
});


app.get(`/${adminKey}/create_test`, (req, res) => {
    mailchimp.createCampaign();
    res.send("Campaign created");
});

app.get(`/${adminKey}/send_test`, (req, res) => {
    mailchimp.setupAndSendCampaign()
    res.send('Campaign message is sent.');
});

app.get(`/${adminKey}/update_test`, (req, res) => {
    jokeapi.getJoke()
    .then((joke) => {
      mailchimp.setCampaignContent(joke);
      res.send("Updated campaign content.");
    })
    .catch((error) => {
      console.log(error);
    })
});

app.get(`/${adminKey}/delete_test`, (req, res) => {
    mailchimp.deleteCampaign();
    res.send("Deleted campaign");
});

 app.get(`/${adminKey}/list_test`, (req, res) => {
    mailchimp.listCampaigns()
       .then((campaignIds) => {
        if(campaignIds.length > 0) 
          res.send(campaignIds[0].id);
        else res.send("No campaign available");  
        })
        .catch((error) => {
          console.log(error);
        })
});
//!-----------------Test endpoint section end----------------------
//-----------------------------------------------------------------
