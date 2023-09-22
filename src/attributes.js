import { $, div, Component, Selected } from './utils.js';

export class StoryAttributes extends Component {
    constructor(parent, timeline){
        super({ parent: $('editor'), class: 'editor' }, parent);
        this.timeline = timeline;
        this.draw();
    }

    draw() {
        this.textEl = div(this.el);
    }

    redraw() {
        console.log(this.timeline.getUniqueCharacters());
    }


    visible(b) {
        super.visible(b);
        if (b) {
            this.redraw();
        }
    }

}