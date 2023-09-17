const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const { defineSecret } = require('firebase-functions/params');
const { Firestore } = require('@google-cloud/firestore');
const openAIApiKey = defineSecret('openai');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();
const bucket = admin.storage().bucket();

// const MODEL = "gpt-4";
// const MODEL = "gpt-3.5-turbo";
const MODEL = "gpt-3.5-turbo-16k";
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
            return { message: 'error', response: r.error };
        else
            return { message: 'ok', response: r };
    });


async function ___cquery(openai_api_key, messages, temperature) {
    console.log("!!!" + messages)
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + openai_api_key
        },
        body: JSON.stringify({
            "model": MODEL,
            "temperature": Number(temperature),
            "max_tokens": 3000,
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

//// Member
exports.Member = functions
    .runWith({ secrets: [openAIApiKey] })
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;
        if (!uid) {
            return { message: 'not logged in' };
        }
        // create a response and add it
        const nounDoc = db.collection('member').doc(uid);
        const nounSnap = await nounDoc.get();
        if (!docSnapshot.exists) {
            const name = context.auth.token.name || null;
            const picture = context.auth.token.picture || null;
            const email = context.auth.token.email || null;
            await nounDoc.set({
                name: name,
                picture: picture,
                email: email,
                created: Firestore.FieldValue.serverTimestamp(),
                updated: Firestore.FieldValue.serverTimestamp(),
                lastHere: Firestore.FieldValue.serverTimestamp()
            });
        } else {
            await nounDoc.update({
                lastHere: Firestore.FieldValue.serverTimestamp()
            })
        }
        return nounDoc.data();
    });


/// Picker CRUD

exports.PickerAdd = functions
    .runWith({ secrets: [openAIApiKey] })
    .https.onCall(async (data, context) => {
        const uid = request.auth.uid;
        if (!uid) {
            return { message: 'not logged in' };
        }

        // create a response and add it
        const nounData = {
            created: Firestore.FieldValue.serverTimestamp(),
            updated: Firestore.FieldValue.serverTimestamp(),
            state: 'public',
            owner: uid,
            // type: data.type,
            name: data.name,
            description: data.description
        };
        // a sub collection in the introduction
        // const res = db
        //     .collection('noun')
        //     .doc(intro.id)
        //     .collection('response')
        //     .add(data);
        const response = await db.collection('noun').add(nounData);
        console.log(response);
        return response;

    });

exports.PickerLoad = functions
    .runWith({ secrets: [openAIApiKey] })
    .https.onCall(async (data, context) => {
        const uid = request.auth.uid;
        if (!uid) {
            return { message: 'not logged in' };
        }

        var nounDoc = db.collection('noun');
        nounDoc.where('owner', '==', uid);
        if (data.project) {
            nounDoc.where('project', '==', data.project);
        }
        if (data.filter) {
            console.log('TODO pickerload filter [' + data.filter + ']');
        }
        nounDoc.orderBy('created', 'asc');
        var nounSnap = await nounDoc.get();
        var nounResults = { items: [] };
        nounSnap.docs.forEach((doc) => {
            nounResults.items.push(doc.data())
        });
        return nounResults;
    });

exports.PickerUpdate = functions
    .runWith({ secrets: [openAIApiKey] })
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;
        if (!uid) {
            return { message: 'not logged in' };
        }

        console.log('....')
        console.log(data)
        if (data.id == null) {
            // create a response and add it
            console.log('....create')
            const nounData = {
                created: Firestore.FieldValue.serverTimestamp(),
                updated: Firestore.FieldValue.serverTimestamp(),
                state: 'public',
                owner: uid,
                // type: data.type,
                name: data.name,
                description: data.description,
                color: data.color,
                icon: data.icon
            };
            const response = await db.collection('noun').add(nounData);
            nounData.id = response.id;
            console.log(nounData);
            return nounData;
        } else {
            console.log('....update '+data.id)
            const nounDoc = db.collection('noun').doc(data.id);
            const nounSnap = await nounDoc.get();
            const response = await nounDoc.update({
                updated: Firestore.FieldValue.serverTimestamp(),
                // type: data.type,
                name: data.name,
                description: data.description,
                color: data.color,
                icon: data.icon
            });
            const nounData = nounSnap.data();
            nounData.id = data.id;
            console.log(nounData);
            return nounData;
        }

    });

exports.PickerDelete = functions
    .runWith({ secrets: [openAIApiKey] })
    .https.onCall(async (data, context) => {
        data.forEach(id => {
            db.collection('noun').doc(id).delete();
        })
        return { message: 'working' };
    });


async function getContext(culturePath, ctx = {}) {
    var C = {
        ...ctx, //agent_intro
        culture_name: null,
        culture_description: null,
        now: new Date()
    };
    if (culturePath) {
        var cultureSnap = await db.doc(culturePath).get();
        var culture = cultureSnap.data();
        C.culture_name = culture.name;
        C.culture_description = culture.description;
    }
    return C;
}

async function addContextSamples(culturePath, ctx = {}) {
    ctx.intro_samples = [];
    var introSnap = await db.collection('introduction')
        .where('culture', '==', culturePath)
        .orderBy('created', 'asc').limit(3).get();
    introSnap.docs.forEach((doc) => {
        ctx.intro_samples.push(doc.data())
    });
    if (ctx.intro_samples.length != 0)
        ctx.intro_text = oneOf(ctx.intro_samples).text;
}
