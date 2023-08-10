var ELEVEN_LABS_API_KEY = '';
// var bSpeechInProgress = false;
var oSpeechRecognizer = null




export function GetVoiceList(callback) {
    console.log('getvlist')

    var oHttp = new XMLHttpRequest();
    oHttp.open("GET", "https://api.elevenlabs.io/v1/voices");
    oHttp.setRequestHeader("Accept", "application/json");
    oHttp.setRequestHeader("Content-Type", "application/json");
    oHttp.setRequestHeader("xi-api-key", ELEVEN_LABS_API_KEY)

    oHttp.onreadystatechange = function () {
        if (oHttp.readyState === 4) {
            var oJson = { voices: [] };
            try {
                oJson = JSON.parse(oHttp.responseText);
            } catch (ex) {
                oJson.error = ex.message;
                console.error(ex);
            }
            callback(oJson);
        }
    };
    oHttp.send();
}


export function TextToSpeech(text, sVoiceId = "21m00Tcm4TlvDq8ikWAM") { //Rachel
    console.log('tts ' + sVoiceId + ' ' + text.substring(0, 10));

    var oHttp = new XMLHttpRequest();
    oHttp.open("POST", "https://api.elevenlabs.io/v1/text-to-speech/" + sVoiceId);
    oHttp.setRequestHeader("Accept", "audio/mpeg");
    oHttp.setRequestHeader("Content-Type", "application/json");
    oHttp.setRequestHeader("xi-api-key", ELEVEN_LABS_API_KEY)

    oHttp.onload = function () {
        if (oHttp.readyState === 4) {
            var oBlob = new Blob([this.response], { "type": "audio/mpeg" });
            var audioURL = window.URL.createObjectURL(oBlob);
            var audio = new Audio();
            audio.src = audioURL;
            audio.play();
        }
    };

    var data = {
        text: text,
        voice_settings: { stability: 0, similarity_boost: 0 }
    };

    oHttp.responseType = "arraybuffer";
    oHttp.send(JSON.stringify(data));
}

function SpeechToText() {

    // if (oSpeechRecognizer) {
    //     if (chkSpeak.checked) {
    //         oSpeechRecognizer.start();
    //     } else {
    //         oSpeechRecognizer.stop();
    //     }
    //     return;
    // }

    oSpeechRecognizer = new webkitSpeechRecognition();
    oSpeechRecognizer.continuous = true;
    oSpeechRecognizer.interimResults = true;
    oSpeechRecognizer.lang = selLang.value;
    oSpeechRecognizer.start();

    oSpeechRecognizer.onresult = function (event) {
        var interimTranscripts = "";
        for (var i = event.resultIndex; i < event.results.length; i++) {
            var transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
                console.log("<final>" + transcript);
            } else {
                transcript.replace("\n", "<br>");
                interimTranscripts += transcript;
                console.log("<interrim>" + interimTranscripts);
            }

        }
    };

    oSpeechRecognizer.onerror = function (event) {

    };
}