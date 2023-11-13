import { $, $$mi, div, Component } from './utils.js';
import { GetVoiceList, TextToSpeech } from './tts.js';

export class Preview extends Component {
    constructor(parent) {
        super({ parent: $('preview'), class: 'preview' });
        this.frame = 0;
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
        var r0 = div(this.el, 'controls');
        var rr = $$mi({ parent: r0, text: 'fast_rewind' });
        var play = $$mi({ parent: r0, text: 'play_arrow' });
        var ff = $$mi({ parent: r0, text: 'fast_forward' });

        rr.addEventListener('click', (e) => {
            this.emit('previous');
        });
        play.addEventListener('click', (e) => {
            this.emit('play')
        });
        ff.addEventListener('click', (e) => {
            this.emit('next');
        });
        // document.addEventListener('keyup', e=>{
        //     if (e.key == 'ArrowLeft'|| e.key=='ArrowDown') {
        //         this.emit('previous');
        //     } else if (e.key == 'ArrowRight' || e.key=='ArrowUp') {
        //         this.emit('next');
        //     }
        // });

        var r1 = div(this.el, '');
        this.title = div(r1, 'title', '');
        this.emoji = div(r1, 'title', '');
        this.summary = div(r1, 'pp', '');
        this.setting = div(r1, 'pp', '');
        this.sensing = div(r1, 'pp', '');
        this.conflict = div(r1, 'pp', '');
    }

    redraw() {
        this.title.innerText = this.value.title;
        this.emoji.innerText = this.value.emoji;
        this.summary.innerText = this.value.summary;
        if (this.value.setting) {
            this.setting.innerText = this.value.setting.description;
            var s = this.value.setting.sensory_details;
            this.sensing.innerText = s.feel + '. ' + s.smell + '. ' + s.sound + '. ' + s.appearance + '.';
        }
        this.conflict.innerText = this.value.conflict_description;
    }



}