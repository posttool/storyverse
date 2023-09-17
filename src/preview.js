import { $, $$mi, div, Component } from './utils.js';
import { GetVoiceList, TextToSpeech } from './tts.js';

export class Preview extends Component {
    constructor(parent) {
        super({ parent: $('preview'), class: 'preview' });
        // GetVoiceList(o => {
        //     console.log(">voices");
        //     console.log(o)
        //     this.voices = o.voices;
        // })
        this.draw();

    }

    read(text) {
        TextToSpeech(text, oneOf(this.voices).voice_id)
    }



    draw() {
        this.toolbarEl = div(this.el);
        this.text = div(this.el);
        this.controlEl = div(this.el, 'controls');
        var rr = $$mi({ parent: this.controlEl, text: 'fast_rewind' });
        var play = $$mi({ parent: this.controlEl, text: 'play_arrow' });
        var ff = $$mi({ parent: this.controlEl, text: 'fast_forward' });

        rr.addEventListener('click', (e) => { this.emit('back'); });
        play.addEventListener('click', (e) => { this.emit('play') });
        ff.addEventListener('click', (e) => { this.emit('forward') });
    }


    // this.frameworkSelect = $$sel({ parent: $top, options: FRAMEWORKS.map(c => c.name) });
    // this.frameworkSelect.addEventListener('change', this.rewrite.bind(this))
    // this.toneSelect = $$sel({ parent: $top, options: TONE.map(c => c.name) });
    // this.toneSelect.addEventListener('change', this.rewrite.bind(this))


    // var framework = this.frameworkSelect.options[this.frameworkSelect.selectedIndex].text;
    // var tone = this.toneSelect.options[this.toneSelect.selectedIndex].text;

}