const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const { defineSecret } = require('firebase-functions/params');
const openAIApiKey = defineSecret('openai');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();
const bucket = admin.storage().bucket();
	
const MODEL = "gpt-3.5-turbo";
// const MODEL = "text-davinci-003";
// const MODEL = "text-curie-001";


exports.testGPT = functions
    .runWith({ secrets: [openAIApiKey] })
    .https.onRequest(async (request, response) => {
        // Message text passed from the client.
        const text = 'hi';//request.query.text;
        // Authentication / user information is automatically added to the request.
        // const uid = request.auth.uid;
        // const name = request.auth.token.name || null;
        // const picture = request.auth.token.picture || null;
        // const email = request.auth.token.email || null;
        //
        var r = await ___cquery(openAIApiKey.value(), text, .5);
        response.json({ message: 'ok', response: r });
    });

exports.testGPTCallable = functions
    .runWith({ secrets: [openAIApiKey] })
    .https.onCall(async (data, context) => {
        // Message text passed from the client.
        const messages = data.messages;
        // Authentication / user information is automatically added to the request.
        // const uid = request.auth.uid;
        // const name = request.auth.token.name || null;
        // const picture = request.auth.token.picture || null;
        // const email = request.auth.token.email || null;
        //
        var r = await ___cquery(openAIApiKey.value(), messages, .5);
        if (r.error) 
            return {message: 'error', response: r.error};
        else
            return { message: 'ok', response: r };
    });


async function ___cquery(openai_api_key, messages, temperature) {
    console.log("!!!"+messages)
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + openai_api_key
        },
        body: JSON.stringify({
            "model": MODEL,
            "temperature": Number(temperature),
            "max_tokens": 256,
            "top_p": 1,
            "frequency_penalty": 0,
            "presence_penalty": 0,
            "messages": messages
        })
    };
    const response = await fetch('https://api.openai.com/v1/chat/completions', requestOptions);
    const data = await response.json();
    if (data.error) {
        console.log("ERROR");
        console.log(data.error);
        return data;
    }
    return data;
}

async function ___igquery(openai_api_key, prompt) {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + openai_api_key
        },
        body: JSON.stringify({
            "n": 1,
            "size": "256x256",
            "prompt": prompt
        })
    };
    const response = await fetch('https://api.openai.com/v1/images/generations', requestOptions);
    const data = await response.json();
    return data;
}
