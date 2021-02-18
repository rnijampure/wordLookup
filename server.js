const express = require('express');
const bodyParser = require('body-parser'); 

var http = require('http'); 
const request = require('request');
const cors = require("cors");
// create express app
const app = express();
// Setup server port
const port = process.env.PORT || 8080;
const APIkey = "dict.1.1.20210216T114936Z.e4989dccd61b9626.373cddfbfb8a3b2ff30a03392b4e0b076f14cff9";

var corsOptions = {
  origin: "*" // BAD RACTICE, ONLY FOR THIS SAMPLE APPLICATION
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
 


getFileFromURL();
//get latest file content to var using request
function getFileFromURL() {
    request('http://norvig.com/big.txt', (err, res, body) => {
        if (err) {
            console.log(err);
        }
        var data = body;
        getUniqueWordAndFrequency(data, 10).then(function (outputJson) {
            console.log(JSON.stringify(outputJson));
        }, function (err) {
            console.error(err);
        });

    }, function (err) {
        console.error(err);
    });
}   

//yandex api service call
function connectToYandexAPI(wordElement) {
  //promise to make async calls
    return new Promise(function (resolve, reject) {
        request('https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=' + APIkey + '&lang=en-en&text=' + wordElement, (err, res, body) => {
            if (err) {
                reject(err);
            }
            resolve(body);
        });
    });
}

function getUniqueWordAndFrequency(data, limit) {
    return new Promise(function (resolve, reject) {
      // remove unwanted charectrs from the content
        var stringWithoutUnwantedCharecters = data.replace(/[.,-/#!$%^&*;:{}=\-_`~()]/g, ""),
        //create an array with all the wordsArrayusing space as a limiter
            wordsArray = stringWithoutUnwantedCharecters.split(' ');
         let    wordFreq = {};// transfer the values to an object so we have a key value pair
           let word, i;

        //remove all empty elements from the array
        wordsArray = wordsArray.filter(entry => /\S/.test(entry));

        for (i = 0; i < wordsArray.length; i++) {
            word = wordsArray[i];
            wordFreq[word] = wordFreq[word] || 0;
            wordFreq[word]++;
        }
        // populating array with words and frequencies
        wordsArray = Object.keys(wordFreq);

        var TopListOfArray = wordsArray.sort(function (a, b) {
            return wordFreq[b] - wordFreq[a];
        }).slice(0, limit);

        var returnArray = [];
        var apisToBeCalled = TopListOfArray.length;
        TopListOfArray.forEach(word => {
            var wordDetailsApi = connectToYandexAPI(word);
            wordDetailsApi.then(function (wordDetails) {
                wordDetails = JSON.parse(wordDetails);
                var returnJsonObject = {
                    "CountOfWord": wordFreq[word]
                };
                if (wordDetails.def[0]) {
                    if ("syn" in wordDetails.def[0]) {
                        returnJsonObject.synonyms = wordDetails.def[0].syn;
                    } else {
                        if ("mean" in wordDetails.def[0]) {
                            returnJsonObject.synonyms = wordDetails.def[0].mean;
                        } else {
                            returnJsonObject.synonyms = "Sorry! No Synonyms found";
                        }
                    }
                    if ("pos" in wordDetails.def[0]) {
                        returnJsonObject.pos = wordDetails.def[0].pos;
                    } else {
                        returnJsonObject.pos = "Sorry! No pos or Part of speech found";
                    }
                } else {
                    returnJsonObject.synonyms = "Sorry! No Synonyms found";
                    returnJsonObject.pos = "Sorry! No Part of speech found";
                }
                // populate array with object containg all details
                returnArray.push({
                    "word": word,
                    "output": returnJsonObject
                });
                apisToBeCalled--;
                if (apisToBeCalled === 0) {
                    returnArray = returnArray.sort(function (a, b) {
                        return b.output.count - a.output.count
                    })
                    var returnJson = {
                        "topwords": returnArray
                    };
                    resolve(returnJson);
                }
            }, function (err) {
                console.error(err);
                reject(err);
            });
        });
    });
}

// listen for requests
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});