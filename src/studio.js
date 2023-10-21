import { $, $$, Component, Selected } from './utils.js';
import { StoryAttributes } from './attributes.js';
import { Picker } from './picker.js';
import { Genre } from './genre.js';
import { Preview } from './preview.js';
import { Account } from './account.js';
import { Document } from './document.js';
import { Timeline, MODE_PLACING, MODE_SELECTING } from './timeline.js';

const GENRE = 'Story';
const PICKER = 'Characters';
const EDITOR = 'Play';
const DRAFT = 'Draft';
const FORMATS = 'Formats';

export class Studio extends Component {
    constructor(services) {
        super({ parent: null, class: 'studio' });
        this.services = services;
        this.document = new Document();

        this.account = new Account(this);
        this.account.addListener('login', e => {
            this.draw();
        });
        this.account.addListener('logout', e => {
            this.visible(true, $("not-logged-in"));
            $("main-tabs").innerHTML = '';
            $("picker").innerHTML = '';
            $("editor").innerHTML = '';
        });

    }

    draw() {
        this.visible(false, $("not-logged-in"));
        $("main-tabs").innerHTML = '';
        this.mainTabs = new MainTabs(this);
        this.mainTabs.selected = PICKER; // TODO save/restore state

        this.genre = new Genre();
        this.picker = new Picker(this, this.document);
        this.timeline = new Timeline(this.document);
        this.player = new Preview(this);
        this.editor = new StoryAttributes(this, this.timeline, this.document);

        this.picker.addListener('select', e => {
            this.timeline.placingData = e;
        });
        this.timeline.addListener('select', e => {
            this.editor.select(e);
        });
        this.timeline.addListener('place', e => {
            console.log(e);
        });
        this.editor.addListener('change', e=>{
            this.timeline.setAttributes(e);
        });
        this.player.addListener('previous', e => {
            this.timeline.gotoFrame(this.timeline.timeZ.destination - 1);
        });
        this.player.addListener('next', e => {
            this.timeline.gotoFrame(this.timeline.timeZ.destination + 1);
        });
        this.mainTabs.addListener('change', value => {
            this.redraw();
        });

        this.picker.load();
        this.redraw();

        document.addEventListener('keyup', e => {
            if (e.key == 'Delete') {
                this.timeline.deleteSelection();
            }
        });
    }

    redraw() {
        this.genre.visible(false);
        this.picker.visible(false);
        this.editor.visible(false);
        this.mainTabs.redraw();
        switch (this.mainTabs.selected) {
            case GENRE:
                this.genre.visible(true);
                this.timeline.mode = MODE_PLACING;
                break;
            case PICKER:
                this.picker.visible(true);
                this.timeline.mode = MODE_PLACING;
                break;
            case EDITOR:
                this.editor.visible(true);
                this.timeline.mode = MODE_SELECTING;
                break;
        }
    }



}


class MainTabs extends Selected {
    constructor() {
        super(
            { parent: $('main-tabs'), class: 'row' },
            [GENRE, PICKER, EDITOR, DRAFT, FORMATS],
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

    select(b) {
       this.selected = b;
       this.redraw();
    }
}