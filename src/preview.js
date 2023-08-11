import { $, Component } from './utils.js';
import { GetVoiceList, TextToSpeech } from './tts.js';

export class Preview extends Component {
    constructor(parent) {
        super({ parent: $('preview'), class: 'preview' });
        GetVoiceList(o => {
            console.log(">voices");
            console.log(o)
            this.voices = o.voices;
        })
        this.draw();
    }

    read(text) {
        TextToSpeech(text, oneOf(this.voices).voice_id)
    }
         // this.frameworkSelect = $$sel({ parent: $top, options: FRAMEWORKS.map(c => c.name) });
        // this.frameworkSelect.addEventListener('change', this.rewrite.bind(this))
        // this.toneSelect = $$sel({ parent: $top, options: TONE.map(c => c.name) });
        // this.toneSelect.addEventListener('change', this.rewrite.bind(this))


       // var framework = this.frameworkSelect.options[this.frameworkSelect.selectedIndex].text;
        // var tone = this.toneSelect.options[this.toneSelect.selectedIndex].text;

}