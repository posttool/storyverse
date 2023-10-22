import { $, $$, $$sel, getSelectValue, setSelectValue, $$mi, div, Component, Selected } from './utils.js';
import { FORTUNES } from './prompts.js';

export class StoryAttributes extends Component {
    constructor(parent, timeline, doc) {
        super({ parent: $('editor'), class: 'row' }, parent);
        this.timeline = timeline;
        this.document = doc;
        this.draw();
    }

    draw() {

        var col1 = div(this.el, 'col1');
        this.objects = new Selected({ parent: col1, class: 'picker-list' }, [], PickerCell);

        var col2 = div(this.el, 'col2');
        this.frameEl = div(col2, '');
        this.formsEl = $$({ parent: col2 });

        this.objects.addListener('change', (value) => {
            this.showCharacterForm(value);
        });

    }


    select(e) {
        this.frame = e.frame;
        this.character = this.frame.data.getById(this.frame.data.getByFortune(e.fortune)[0]);
        //
        this.nouns = [];
        e.frame.data.characters.forEach(char => {
            this.nouns.push(char);
        });

        if (this.character == null && this.nouns.length != 0) {
            this.character = this.nouns[0];
        }
        // if (e.frame.data.setting) {
        //     this.nouns.push(this.frame.data.getById(e.frame.data.setting));
        // }
        this.redraw();
    }

    redraw() {
        if (this.nouns) {
            this.objects.value = this.nouns;
            this.objects.selected = this.character;
            this.frameEl.innerText = "Scene " + this.frame.index ;
            if (this.nouns.length==0) 
                this.frameEl.innerText += " (empty)"
            this.showCharacterForm();
        }
    }

    showCharacterForm(value) {
        if (value) {
            this.character = this.frame.data.getById(value.id);
            this.objects.selected = this.character;
        }
        this.formsEl.innerText = '';
        if (this.character) {
            var form = new CharacterForm(this.formsEl, this, this.character, this.nouns);
            form.addListener('change', e => {
                e.frame = this.frame;
                this.emit('change', e);
            });
        }
    }

    visible(b) {
        super.visible(b);
        if (b) {
            this.redraw();
        }
    }



}





export class PickerCell extends Component {
    constructor(list, value) {
        super({ parent: list.el, class: 'picker-cell' });
        this.draw();
        this.value = value;
        this.redraw();
    }

    draw() {
        this.iconEl = $$({ parent: this.el, class: 'icon' });
        this.iconImg = $$({ parent: this.iconEl, el: 'img' });
        this.textEl = $$({ parent: this.el, class: 'textc' });
        this.textEl1 = $$({ parent: this.textEl, class: 'text' })
        this.el.addEventListener('click', e => {
            this.emit('click');
        });
    }

    redraw() {
        // this.iconEl.style.backgroundColor = this.value.color;
        const doc = this.value.doc();
        if (doc.icon)
            this.iconImg.src = doc.icon;
        if (doc.name)
            this.textEl1.innerText = doc.name;
    }

    select(b) {
        if (b) {
            this.el.classList.add('selected');
        } else {
            this.el.classList.remove('selected');
        }
    }

}







export class CharacterForm extends Component {
    constructor(parentEl, parentComponent, characterData, conflicts) {
        super({ parent: parentEl, class: '' }, parentComponent);
        this.selected = characterData;
        this.conflicts = conflicts;
        this.draw();
        this.redraw();
    }

    draw() {
        var $r2 = $$({ parent: this.el, class: 'row' });
        this.fortuneEl = $$sel({ parent: $r2, options: FORTUNES.map(o => o.name) });
        this.fortuneEl.addEventListener('change', e => {
            this.setValueFromUi();
        });
        var $r3 = $$({ parent: this.el, class: 'row' });
        var conflictOptions = [['No conflict', '-1']];
        for (var i = 0; i < this.conflicts.length; i++) {
            var doc = this.conflicts[i].doc();
            conflictOptions.push([doc.name, doc.id]);
        }
        this.conflictEl = $$sel({ parent: $r3, options: conflictOptions, namevalue: true });
        this.conflictEl.addEventListener('change', e => {
            this.setValueFromUi();
        })
        // var $r4 = $$({ parent: this.el, class: 'row' });
        // this.colors = new Colors($r4);

        // var $r5 = $$({ parent: this.el, class: 'row' });

        var $r6 = $$({ parent: this.el, class: 'row' });
        var delEl = $$mi({ parent: $r6, text: 'delete' });
        delEl.addEventListener('click', e => {
            this.el.style.opacity = .5;
            // this.parent.services.Picker.Delete([this.value.id]).then(results => {
            //     this.el.innerText = '';
            //     this.emit('deleted');
            // });
        });

        // delete
        // this.parent.services.Picker.Delete(idsOfSelected).then(results => {
        // });

        //
        // this.icons.addListener('change', this.setValueFromUi.bind(this));
        // this.nameEl.addEventListener('keyup', this.setValueFromUi.bind(this));
        // this.descriptionEl.addEventListener('keyup', this.setValueFromUi.bind(this));
    }

    setValueFromUi() {
        this.emit('change', {
            character: this.selected,
            fortune: this.fortuneEl.selectedIndex,
            conflict: getSelectValue(this.conflictEl)
        });
    }

    redraw() {
        this.fortuneEl.selectedIndex = this.selected.fortune;
        setSelectValue(this.conflictEl, this.selected.conflict);
    }
}


