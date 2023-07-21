import { $, $$ } from './utils.js';
import { SB } from './scrapbook.js';
import { Studio } from './studio.js';
import { Storyline } from './editor.js';

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

var testGPT = httpsCallable(firebaseFunctions, 'testGPTCallable');
var studio = new Studio($('root'));




///


var characters = [];
var settings = [];

var dropped = false;
function handleDragStart(e) {
    this.style.opacity = '0.4';
    e.dataTransfer.setData("color", this.style.backgroundColor);
    e.dataTransfer.setData("idx", this.id.substring(2));
}

function handleDragEnd(e) {
    if (!dropped)
        this.style.opacity = '1'; // if you drop it in a wierd place
    dropped = false;
}

function allowDrop(e) {
    e.preventDefault();
    return false;
}

function drop(e) {
    e.preventDefault();
    var color = e.dataTransfer.getData("color");
    e.target.style.backgroundColor = color;
    e.target.style.border = '0'
    $("button-done").style.visibility = 'visible';
    dropped = true;
    var idx = Number(e.dataTransfer.getData("idx"));
    if (e.target.className == 'place') {
        characters.push(idx);
    } else {
        settings.push(idx);
    }
    return false;
}
function addStuff() {
    var $stuff = $('stuff-body');
    for (var i = 0; i < SB.length; i++) {
        var $si = $$({
            text: SB[i].type + ' ' + SB[i].name,
            parent: $stuff, class: 'stuff-item', id: 'si' + i
        });
        $si.draggable = "true";
        $si.addEventListener('dragstart', handleDragStart);
        $si.addEventListener('dragend', handleDragEnd);
        $si.style.backgroundColor = SB[i].color;
    }
}

function change_framework() {
    var e = $framework_select;
    var framework = e.options[e.selectedIndex].text;
    $instruction.innerText = framework + ' 🎭';
    if (populatef)
        populatef(framework);
}







// state 2 // timeline
var $stage = $('stage-body');
var $button_done = $("button-done");
var $framework_container = $("framework_container");
var $framework_select = $("framework");
var $instruction = $("instruction");
var populatef = null;
function showTimeline() {
    $instruction.innerText = 'Select framework and have fun'
    $button_done.style.visibility = 'hidden';
    $framework_container.style.visibility = 'visible';
    $framework_select.addEventListener('change', change_framework);
    $stage.classList.remove('bigpad');
    $stage.style.display = 'block';
    $stage.innerHTML = '';

    var editor = new Storyline($stage);

    populatef = (framework) => {
        editor.framework = framework;
        while (characters.length < 2) {
            characters.push(Math.round(Math.random() * SB.length));
        }
        while (settings.length < 1) {
            settings.push(Math.round(Math.random() * SB.length));
        }
        // insert these characters into the "template"
        var s0 = settings[0], c1 = characters[1], c2 = characters[0];
        editor.sections[0].value.index = s0;
        editor.sections[0].targets[0].value.index = c1;
        editor.sections[1].value.index = s0;
        editor.sections[1].targets[0].value.index = c2;
        editor.sections[1].targets[1].value.index = c1;
        editor.sections[2].value.index = s0;
        editor.sections[2].targets[0].value.index = c1;
        editor.redraw();

        update_story(editor)

    }

    var update_story = (editor) => {
        var messages = [];
        messages.push({ role: 'user', content: editor.sections[0].writingInstruction });
        console.log('beginning');
        console.log(messages);
        testGPT({ messages: messages })
            .then((result) => {
                // var finish_reason = result.data.response.choices[0].finish_reason;
                var beginning = result.data.response.choices[0].message;
                messages.push(beginning);
                editor.sections[0].format(beginning.content);

                messages.push({ role: 'user', content: editor.sections[1].writingInstruction });
                console.log('middle');
                console.log(messages);
                testGPT({ messages: messages })
                    .then((result) => {
                        var middle = result.data.response.choices[0].message;
                        messages.push(middle);
                        editor.sections[1].format(middle.content);

                        messages.push({ role: 'user', content: editor.sections[2].writingInstruction });
                        console.log('end');
                        console.log(messages);
                        testGPT({ messages: messages })
                            .then((result) => {
                                var end = result.data.response.choices[0].message;
                                messages.push(end);
                                editor.sections[2].format(end.content);


                            });

                    });
            });
    }

}

///






// characters = [2,1];
// settings = [6];
// showTimeline();


// 