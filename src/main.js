import { Studio } from './studio.js';

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFirebaseConfig } from './firebase-config.js';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = getFirebaseConfig();
const firebaseApp = initializeApp(firebaseConfig);
const firebaseFunctions = getFunctions(firebaseApp);

console.log(window.location.hostname)
if (window.location.hostname.includes("localhost")) {
    console.log("USING EMULATOR!")
    connectFirestoreEmulator(getFirestore(), 'localhost', 8080);
    connectFunctionsEmulator(firebaseFunctions, "localhost", 5001);
}

var studio = new Studio({
    Member: {
        Init: httpsCallable(firebaseFunctions, 'Member')
    },
    GPT: {
        Test: httpsCallable(firebaseFunctions, 'testGPTCallable')
    },
    Picker: {
        Load: httpsCallable(firebaseFunctions, 'PickerLoad'),
        Update: httpsCallable(firebaseFunctions, 'PickerUpdate'),
        Delete: httpsCallable(firebaseFunctions, 'PickerDelete')
    }
}); 