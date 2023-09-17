import { $, $$, Component, Selected } from './utils.js';
import { CharacterAttributes } from './attributes.js';
import { Picker } from './picker.js';
import { Preview } from './preview.js';
import { Account } from './account.js';
import { Timeline } from './timeline.js';

const PICKER = 'Story Cast';
const EDITOR = 'Cast Attributes';


export class Studio extends Component {
    constructor(services) {
        super({ parent: null, class: 'studio' });
        this.services = services;

        this.account = new Account(this);

        this.account.addListener('login', e => {
            this.visible(false, $("not-logged-in"));
            $("main-tabs").innerHTML = '';
            this.mainTabs = new MainTabs(this);
            this.mainTabs.addListener('change', value => {
                this.redraw();
            });
            this.mainTabs.value = PICKER; // TODO save/restore state
            this.mainTabs.redraw();
            this.picker = new Picker(this);
            this.picker.toolbar(true);
            this.picker.load();
            this.picker.addListener('select', e=>{
                this.timeline.data = e;
            })
            this.timeline = new Timeline();
            this.editor = new CharacterAttributes(this);
            this.editor.visible(false);
            this.player = new Preview(this);
        });
        this.account.addListener('logout', e => {
            this.visible(true, $("not-logged-in"));
            $("main-tabs").innerHTML = '';
            $("picker").innerHTML = '';
            $("editor").innerHTML = '';
        });

    }

    redraw() {
        switch (this.mainTabs.value) {
            case PICKER:
                this.picker.visible(true);
                this.editor.visible(false);
                break;
            case EDITOR:
                this.picker.visible(true);
                this.editor.visible(true);
                break;
        }
    }

  

}


class MainTabs extends Selected {
    constructor() {
        super(
            { parent: $('main-tabs'), class: 'row' },
            [PICKER, EDITOR],
            TabCell
        );
    }
}

class TabCell extends Component {
    constructor(parent, text) {
        super({ parent: parent.el, class: 'tab' }, parent);
        this.value = text;
        this.draw();
    }

    draw() {
        this.titleEl = $$({ parent: this.el, class: 'title' });
        this.titleEl.addEventListener('click', e => {
            this.emit('click', this);
        })
        this.redraw();
    }

    redraw() {
        this.titleEl.innerText = this.value;
        if (this.selected) {
            this.el.classList.add('selected');
        } else {
            this.el.classList.remove('selected');
        }
    }
}