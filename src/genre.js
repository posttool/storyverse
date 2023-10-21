import { $, $$, $$mi, $$sel, getSelectValue, div, Component } from './utils.js';
import { FRAMEWORKS, TONE } from './prompts.js'

export class Genre extends Component {
    constructor(parent) {
        super({ parent: $('picker'), class: 'genre' });
        this.draw();
    }

    draw() {
        this.frameworksEl = $$sel({ parent: this.el, options: FRAMEWORKS.map(v => v.name) });
        this.title = $$({ parent: this.el, el: 'input' })
        this.title.placeholder = 'title';
        this.tonesEl = $$sel({ parent: this.el, options: TONE.map(v => v.name) })

    }

    get value() {
        return {
            framework: getSelectValue(this.frameworksEl),
            title: this.title.value,
            tone: getSelectValue(this.tonesEl)
        };
    }

    set value(o){
        console.log("TODO Genre set value")
    }



}

