import { $, $$, $$mi, $$sel, getSelectValue, div, Component } from './utils.js';
import { getInstructions } from './prompts.js'

export class Draft extends Component {
    constructor(parent, doc) {
        super({ parent: $('picker'), class: 'draft' }, parent);
        this.document = doc;
        this.draw();
    }

    draw() {
        this.title = div(this.el, '', 'title')
    }

    visible(b) {
        super.visible(b);
        if (b) {
            var o = this.document.toSimpleObject();
            var i = getInstructions(o);
            console.log(i);
            this.title.innerText = i;
                this.parent.services.GPT.Test({ messages: [{ role: 'user', content: i }] })
                .then((result) => {
                    // var finish_reason = result.data.response.choices[0].finish_reason;
                    var message = result.data.response.choices[0].message;
                    console.log(message.content);
                    this.title.innerText = message.content;
                });
        }
    }



}

