import { $, $$, $$mi, $$sel, Component, DbItemList, Toggle, Selected, div } from './utils.js';
import { ICONS, ICON_BASEPATH } from './icons.js';
import {
    getFirestore,
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
} from 'firebase/firestore';


export class Picker extends Component {
    constructor(parent) {
        super({ parent: $('picker'), class: 'row' }, parent);
        this.draw();
    }

    draw() {
        var col1 = div(this.el, 'col1');
        this.toolbarEl = $$({ parent: col1, class: 'picker-toolbar' });
        this.objects = new DbItemList({ parent: col1, class: 'picker-list' }, PickerCell);
        this.add = new PickerAddCell(this, col1);

        var col2 = div(this.el, 'col2');
        this.formsEl = $$({ parent: col2 });

        this.objects.addListener('click', (index) => {
            this.showPickerForm(index);
        });
        this.add.addListener('click', e => {
            this.showPickerForm();
        });
    }

    redraw() {
    }


    load() {
        const c = collection(getFirestore(), 'noun');
        const o = orderBy('name', 'asc');
        const w = where('owner', '==', this.parent.account.value.uid);
        const q = query(c, w, o, limit(50));
        var self = this;
        onSnapshot(q,
            function (snapshot) {
                snapshot.docChanges().forEach(function (change) {
                    self.dataChangeHandler(change);
                });
                self.redraw();
            }, function (e) {
                console.error('snapshot error Picker.load');
                console.error(e);
            });
    }

    dataChangeHandler(change) {
        if (change.type === 'removed') {
            this.objects.remove(change.doc.id);
        } else {
            let doc = change.doc.data();
            doc.id = change.doc.id;
            this.objects.update(doc, 'name');
            if (this.form)
               this.emit('select', this.form.value);
        }
    }

    showPickerForm(index) {
        this.formsEl.innerText = '';
        this.form = new PickerForm(this.formsEl, this.parent);
        this.form.addListener('update', e => {
            this.objects.select(e);
        })
        if (index != null) {
            this.form.value = this.objects.value[index];
            this.emit('select', this.form.value);
        }
        this.form.redraw();
        this.objects.select(this.form.value);
    }


}


export class PickerCell extends Component {
    constructor(list, value) {
        super({ parent: list.el, class: 'picker-cell' });
        this.value = value;
        this.draw();
        this.redraw();
    }

    draw() {
        this.iconEl = $$({ parent: this.el, class: 'icon' });
        this.iconImg = $$({ parent: this.iconEl, el: 'img' });
        this.textEl = $$({ parent: this.el, class: 'textc' });
        $$({ parent: this.textEl, class: 'text', text: this.value.name })
        // $$({ parent: this.textEl, class: 'text2', text: this.value.description.substring(0,16) })
        this.el.addEventListener('click', e => {
            this.emit('click');
        });
    }

    redraw() {
        this.iconEl.style.backgroundColor = this.value.color;
        if (this.value.icon)
            this.iconImg.src = this.value.icon;
    }

    select(b) {
        if (b) { this.el.classList.add('selected'); } else { this.el.classList.remove('selected'); }
    }

}


export class PickerAddCell extends Component {
    constructor(parent, parentEl) {
        super({ parent: parentEl, class: 'picker-cell' }, parent);
        this.draw();
    }

    draw() {
        this.titleEl = $$({ parent: this.el, class: 'icon' });
        $$mi({ parent: this.titleEl, text: 'add_circle', class: 'padding-smal big-icon' });
        this.textEl = $$({ parent: this.el, class: 'textc' });
        $$({ parent: this.textEl, class: 'text', text: 'Add ...' })
        this.el.addEventListener('click', e => {
            this.emit('click');
        });
    }
}


export class PickerForm extends Component {
    constructor(parentEl, parentComponent) {
        super({ parent: parentEl, class: 'picker-form' }, parentComponent);
        this.types = ['person', 'animal', 'plant', 'thing', 'place', 'idea'];
        this.waiting = false;
        this.waitingQueued = false;
        this.draw();
    }

    draw() {
        var $r2 = $$({ parent: this.el, class: 'row' });
        // $$({ parent: $r2, text: 'Name', class: 'form-label' })
        this.nameEl = $$({ parent: $r2, el: 'input', class: 'form-input' });

        var $r3 = $$({ parent: this.el, class: 'row' });
        // $$({ parent: $r3, class: 'form-label', text: 'Description' });
        this.descriptionEl = $$({ parent: $r3, el: 'textarea', class: 'form-textarea' });

        // var $r4 = $$({ parent: this.el, class: 'row' });
        // $$({ parent: $r4, class: 'form-label', text: 'Color' })
        // this.colors = new Colors($r4);

        var $r5 = $$({ parent: this.el, class: 'row' });
        // $$({ parent: $r5, class: 'form-label', text: 'Icon' });
        this.icon = $$({ parent: $r5, el: 'img' });
        var chooseIcon = $$({ parent: $r5, text: 'Choose Icon', el: 'button' })

        this.icons = new Icons(this.el);
        this.icons.visible(false);

        chooseIcon.addEventListener('click', e => {
            this.icons.visible(true);
        });

        var $r6 = $$({ parent: this.el, class: 'row' });
        var delEl = $$mi({ parent: $r6, text: 'delete' });
        delEl.addEventListener('click', e => {
            this.el.style.opacity = .5;
            this.parent.services.Picker.Delete([this.value.id]).then(results => {
                this.el.innerText = '';
                this.emit('deleted');
            });
        });

        // delete
        // this.parent.services.Picker.Delete(idsOfSelected).then(results => {
        // });

        //
        // this.closeButton.addEventListener('click', e => { this.parent.remove(this); });
        // this.colors.addListener('change', this.setValueFromUi.bind(this));
        this.icons.addListener('change', this.setValueFromUi.bind(this));
        this.nameEl.addEventListener('keyup', this.setValueFromUi.bind(this));
        this.descriptionEl.addEventListener('keyup', this.setValueFromUi.bind(this));
    }

    setValueFromUi() {
        clearTimeout(this.callSaveId);
        this.callSaveId = setTimeout(() => {
            if (this.isSaving) {
                this.setValueFromUi();
            } else {
                this.value = {
                    id: this.value ? this.value.id : null,
                    // type: this.typeEl.options[this.typeEl.selectedIndex].text,
                    name: this.nameEl.value,
                    description: this.descriptionEl.value,
                    // color: this.colors.value,
                    icon: this.icons.value
                }
                this.isSaving = true;
                this.parent.services.Picker.Update(this.value).then(results => {
                    this.value.id = results.data.id;
                    this.icons.visible(false);
                    this.redraw();
                    this.emit('update', this.value);
                    this.isSaving = false;
                });
            }
        }, 500);
    }

    redraw() {
        if (this.value) {
            // this.typeEl.selectedOption = this.types.indexOf(this.value.type);
            this.nameEl.value = this.value.name;
            this.descriptionEl.textContent = this.value.description;
            // this.colors.value = this.value.color;
            // this.colors.redraw();
            if (this.value.icon) {
                this.icons.value = this.value.icon;
                this.icon.src = this.value.icon;
            }
            this.icons.redraw();
        }
    }
}


class Colors extends Selected {
    constructor(parentEl) {
        super(
            { parent: parentEl, class: 'colors' },
            ['#FF5555', '#55B8FF', '#5566FF', '#F1B732', '#A055FF', '#4BBB78'],
            ColorCell
        );
    }
}

class ColorCell extends Component {
    constructor(parent, color) {
        super({ parent: parent.el, class: 'color-choice' }, parent);
        this.value = color;
        this.draw();
    }

    draw() {
        this.el.addEventListener('click', e => {
            this.emit('click', this);
        })
        this.redraw();
    }

    redraw() {
        this.el.style.backgroundColor = this.value;
        if (this.selected) {
            this.el.classList.add('selected');
        } else {
            this.el.classList.remove('selected');
        }
    }
}


class Icons extends Selected {
    constructor(parentEl) {
        super(
            { parent: parentEl, class: 'icons-picker' },
            Array.from(ICONS, (icon) => ICON_BASEPATH + icon),
            IconCell);
    }
}

class IconCell extends Component {
    constructor(parent, png) {
        super({ parent: parent.el, el: 'img', class: 'icon-choice' }, parent);
        this.value = png;
        this.draw();
    }

    draw() {
        this.el.addEventListener('click', e => {
            this.emit('click', this);
        })
        this.redraw();
    }

    redraw() {
        if (this.value) {
            this.el.src = this.value;
        }
        if (this.selected) {
            this.el.classList.add('selected');
        } else {
            this.el.classList.remove('selected');
        }
    }
}
