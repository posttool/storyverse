import { $, $$, $$mi, $$sel, getSelectValue, div, Component } from './utils.js';
import { getInstructions } from './prompts.js'

export class Draft extends Component {
    constructor(parent, doc) {
        super({ parent: $('picker'), class: 'draft' }, parent);
        this.document = doc;
        this.writing = null;
        this.generating = false;
        this.draw();
    }

    draw() {
        var $r0 = div(this.el, 'row');
        this.loadEl = $$mi({ parent: $r0, text: 'refresh' });
        this.loadEl.addEventListener('click', e => {
            this.generateStory();
        });

        var $r1 = div(this.el, 'row');
        this.title = div($r1, 'pp', 'Click to generate')
    }

    redraw() {
        this.loadEl.style.opacity = this.generating ? .3 : 1;
        if (this.writing) {
            this.title.innerText = JSON.stringify(this.writing);
        }
    }

    generateStory() {
        var o = this.document.toSimpleObject();
        if (o.characters.length==0) {
            this.title.innerText = 'Add characters first';
            return;
        }
        if (this.generating) {
            console.log('busy...')
            return;
        }
        this.generating = true;
        this.redraw();
        var i = getInstructions(o);
        console.log(i);
        this.title.innerText = i;
        this.parent.services.GPT.Test({ messages: [{ role: 'user', content: i }] })
            .then((result) => {
                this.generating = false;
                // var finish_reason = result.data.response.choices[0].finish_reason;
                var message = result.data.response.choices[0].message;
                if (message.content.indexOf("```json")==0) {
                    message.content = message.content.substring(7, message.content.length-3);
                }
                console.log(message.content);
                this.writing = JSON.parse(message.content);
                this.redraw();
                this.updateDocument();
                this.emit('generate', this.writing);
            });

    }

    updateDocument(){
        this.document.title = this.writing.title;
        this.document.subtitle = this.writing.subtitle;
        for (var i=0; i<this.writing.chapters.length && i<this.document.frames.length; i++) {
            var genChapter = this.writing.chapters[i];
            var frame = this.document.frames[i];
            frame.title = genChapter.title;
            frame.emoji = genChapter.emoji;
            frame.summary = genChapter.summary;
            frame.setting_info = genChapter.setting;
            frame.conflict_description = genChapter.conflict_description;
            for (var j=0; j<genChapter.characters.length; j++) {
                var genChar = genChapter.characters[j];
                var cd = frame.getByName(genChar.name);
                if (cd) {
                    cd.point_of_view = genChar.point_of_view;
                    cd.attitude = genChar.attitude;
                    cd.fortune_summary = genChar.fortune_summary;
                } else {
                    console.log("no "+genChar.name);
                }
            }
            
        }
    }



}

