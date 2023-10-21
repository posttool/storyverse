import { $, $$, $$mi, $$sel, getSelectValue, div, Component } from './utils.js';
import { FRAMEWORKS, TONE } from './prompts.js'

export class Draft extends Component {
    constructor(parent, doc) {
        super({ parent: $('picker'), class: 'draft' });
        this.document = doc;
        this.draw();
    }

    draw() {
        this.title = div(this.el, '', 'title')
    }

    visible(b) {
        super.visible(b);
        var o = this.document.toSimpleObject();
        console.log(o);
        this.title.innerText = JSON.stringify(o);
    }



}

