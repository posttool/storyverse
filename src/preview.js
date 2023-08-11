import { $, Component } from './utils.js';
import { GetVoiceList, TextToSpeech } from './tts.js';

export class Preview extends Component {
    constructor(parent) {
        super({ parent: $('preview'), class: 'preview' });
        GetVoiceList(o => {
            console.log(">"+o)
            this.voices = o.voices;
        })
        this.draw();
    }

}