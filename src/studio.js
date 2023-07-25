import { $, $$, Component, Selected } from './utils.js';
import { Storyline } from './editor.js';
import { Picker, PickerForm } from './picker.js';
import { Preview } from './preview.js';
import { Account } from './account.js';

const PICKER = 'Power Picker';
const MIXER = 'Magic Mixer';
const PLAYER = 'Super Story';


export class Studio extends Component {
    constructor(services) {
        super({ parent: null, class: 'studio' });
        this.services = services;

        this.account = new Account(this);



        this.account.addListener('login', e => {
            $("not-logged-in").innerHTML = '';
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
            this.editor = new Storyline(this);
            this.editor.visible(false);
            this.player = new Preview(this);
            this.player.visible(false);
        });
        this.account.addListener('logout', e => {
            $("not-logged-in").innerHTML = '<img src="img/tape.png"><div class="title">Make &amp; mix stories by playing with shapes</div>';
            $("main-tabs").innerHTML = '';
            $("picker").innerHTML = '';
            $("editor").innerHTML = '';
        });

    }

    redraw() {
        switch (this.mainTabs.value) {
            case PICKER:
                this.picker.visible(true);
                this.picker.toolbar(true);
                this.picker.draggable(false);
                this.editor.visible(false);
                $('picker').style.width = '282px';
                break;
            case MIXER:
                this.picker.visible(true);
                this.picker.toolbar(false);
                this.picker.draggable(true);
                this.editor.visible(true);
                $('picker').style.width = '100px';
                break;
            case PLAYER:
                this.picker.visible(false);
                this.editor.visible(false);
                break;
        }
    }

  

}


class MainTabs extends Selected {
    constructor() {
        super(
            { parent: $('main-tabs'), class: 'row' },
            [PICKER, MIXER, PLAYER],
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