const express = require('express');
const request = require('request');
const app = express();
const bodyParser = require('body-parser');
const mailchimp = require("@mailchimp/mailchimp_marketing");
mailchimp.setConfig({
    apiKey: "1b324b336463f538869a6c2917b1ef38-us18",
    server: "us18",
  });
const listId = "fc8da8e711";

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname)); //css miatt

app.listen(process.env.PORT || 3000, () => {  
    console.log(`Server is running on port 3000.`); 
    pingMailChimpServer();
});

app.get('/', (req, res) => {
    console.log("Csatlakoztak a szerverre");
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
     console.log("Nem volt sikeres");
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