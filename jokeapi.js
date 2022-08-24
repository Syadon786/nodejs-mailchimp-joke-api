const https = require('https');
//-----------------------------------JokeApi api setup-----------------------------------
const jokeApiUrl = "https://v2.jokeapi.dev/joke/Programming?";
const jokeApiParameters = {
    amount: 1,
    blacklistFlags: ['nsfw', 'racist', 'sexist']
};

//!------------------Get a joke with jokeapi-----------------------------------
exports.getJoke = () => {
    return new Promise((resolve, reject) =>  {
        https.get(`${jokeApiUrl}${new URLSearchParams(jokeApiParameters).toString()}`, (response) => {
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
    let joke = "";
    if(joke_json.type == "twopart") {
        joke = `${joke_json.setup}\n${joke_json.delivery}`;
        return joke;
    }
    return joke_json.joke;
}
  