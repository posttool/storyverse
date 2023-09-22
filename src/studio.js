import { $, $$, Component, Selected } from './utils.js';
import { StoryAttributes } from './attributes.js';
import { Picker } from './picker.js';
import { Preview } from './preview.js';
import { Account } from './account.js';
import { Timeline, MODE_PLACING, MODE_SELECTING } from './timeline.js';

const PICKER = 'Story Cast';
const GENRE = 'Story Genre';
const EDITOR = 'Cast Attributes';
const DRAFT = 'Story Draft';
const FORMATS = 'Export and Formats';

export class Studio extends Component {
    constructor(services) {
        super({ parent: null, class: 'studio' });
        this.services = services;

        this.account = new Account(this);

        this.account.addListener('login', e => {
            this.visible(false, $("not-logged-in"));
            $("main-tabs").innerHTML = '';
            this.mainTabs = new MainTabs(this);
            this.mainTabs.value = PICKER; // TODO save/restore state
            this.mainTabs.redraw();
            this.picker = new Picker(this);
            this.timeline = new Timeline();
            this.picker.addListener('select', e => {
                this.timeline.data = e;
            });
            this.picker.load();

            this.editor = new StoryAttributes(this, this.timeline);
            this.timeline.addListener('changeFrame', e => {

            });
            this.timeline.addListener('select', e => {
                console.log(e);
                // this.editor.setData(e);
            });
            this.timeline.addListener('place', e => {
                //todo
            });
            this.editor.visible(false);

            this.player = new Preview(this);
            this.player.addListener('previous', e => {
                this.timeline.gotoFrame(this.timeline.timeZ.destination - 1);
            });
            this.player.addListener('next', e => {
                this.timeline.gotoFrame(this.timeline.timeZ.destination + 1);
            });

            this.mainTabs.addListener('change', value => {
                this.redraw();
            });

            document.addEventListener('keyup', e => {
                console.log(e.key)
                if (e.key == 'Delete') {
                    this.timeline.deleteSelection();
                }
            });

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
                this.timeline.mode = MODE_PLACING;
                break;
            case EDITOR:
                this.picker.visible(false);
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
            [PICKER, GENRE, EDITOR, DRAFT, FORMATS],
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