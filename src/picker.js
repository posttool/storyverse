import { $, $$, $$mi, $$sel, Component, DbItemList, Toggle, Selected } from './utils.js';

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
        super({ parent: $('picker'), class: 'picker' }, parent);
        this.forms = [];
        this.draw();
    }

    draw() {
        this.toolbarEl = $$({ parent: this.el, class: 'picker-toolbar' });
        this.delEl = $$mi({ parent: this.toolbarEl, class: 'button-delete', text: 'delete' });
        // this.collapseEl = $$mi({ parent: this.toolbarEl, class: 'button-collapse', text: 'chevron_left' });
        this.objects = new DbItemList({ parent: this.el, class: 'picker-list' }, PickerCell);
        this.add = new PickerAddCell(this);
        this.formsEl = $$({ parent: $('editor') });

        this.delEl.addEventListener('click', (e) => {
            this.delEl.innerText = 'sync';
            var idsOfSelected = [];
            this.objects.getSelected().forEach(v => {
                idsOfSelected.push(v.id);
            });
            //this.delEl shows animation and selected go greyish...
            this.parent.services.Picker.Delete(idsOfSelected).then(results => {
                setTimeout(this.redraw.bind(this), 1000);
            });
        });
        this.objects.addListener('select', (e) => {
            this.redraw();
        });
        this.objects.addListener('click', (e) => {
            this.showPickerForm(e);
        });
        this.add.addListener('click', e => {
            this.showPickerForm();
        });

    }

    redraw() {
        var sel = this.objects.getSelected();
        this.delEl.innerText = 'delete';
        this.delEl.style.visibility = sel.length == 0 ? 'hidden' : 'visible';
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
        }
    }

    showPickerForm(index) {
        var form = new PickerForm(this.formsEl, this.parent);
        if (index != null) {
            form.value = this.objects.value[index]
        }
        form.redraw();
    }

    visible(b) {
        super.visible(b);
        super.visible(b, this.formsEl);
    }

    toolbar(b) {
        super.visible(b, this.toolbarEl);
        this.objects.selectable(b);
        this.add.visible(b);
    }

    draggable(b) {
        this.objects.selectable(!b);
        this.objects.draggable(b);
        this.add.visible(!b);
        super.visible(!b, this.formsEl);
        // this.el.width = b ? '80px' : '280px';
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
        this.textEl = $$({ parent: this.el, class: 'textc' });
        $$({ parent: this.textEl, class: 'text', text: this.value.name })
        $$({ parent: this.textEl, class: 'text2', text: this.value.description })
        this.toggle = new Toggle(this);
        this.toggle.addListener('change', v => {
            this.emit('change');
        });
        // this.el.addEventListener('click', e => {
        //     this.emit('click');
        // });
        this.el.addEventListener('dblclick', e => {
            this.emit('click');
        });
    }

    redraw() {
        this.iconEl.style.backgroundColor = this.value.color;
    }

    selectable(b) {
        this.toggle.visible(b);
        this.visible(b, this.textEl);
        if (!b)
            this.el.classList.add('picker-cell-min');
        else
            this.el.classList.remove('picker-cell-min');
    }
    draggable(b) {
        if (b) {
            this.iconEl.draggable = 'true';
            this.iconEl.addEventListener('dragstart', this._dragstart.bind(this));
            this.iconEl.addEventListener('dragend', this._dragend.bind(this));
        } else {
            this.iconEl.draggable = 'false';
            this.iconEl.removeEventListener('dragstart', this._dragstart);
            this.iconEl.removeEventListener('dragend', this._dragend);
        }
    }
    _dragstart(e) {
        e.dataTransfer.setData("id", this.value.id);
    }
    _dragend(e) {
        console.log("dragend>" + e.dataTransfer.getData("id"));
    }
}


export class PickerAddCell extends Component {
    constructor(parent) {
        super({ parent: parent.el, class: 'picker-cell' }, parent);
        this.draw();
    }

    draw() {
        this.titleEl = $$({ parent: this.el, class: 'icon' });
        $$mi({ parent: this.titleEl, text: 'add_circle', class: 'black-text padding-small' });
        this.textEl = $$({ parent: this.el, class: 'textc' });
        $$({ parent: this.textEl, class: 'text', text: 'Add a new place, thing...' })
        $$({ parent: this.textEl, class: 'text2', text: 'Grab whatever' });
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
        var $r0 = $$({ parent: this.el, class: 'row' });
        this.closeButton = $$mi({ parent: $r0, text: 'close' });
        // var $r1 = $$({ parent: this.el, class: 'row' });
        // $$({ parent: $r1, text: 'Type', class: 'form-label' })
        // this.typeEl = $$sel({ parent: $r1, options: this.types });
        var $r2 = $$({ parent: this.el, class: 'row' });
        $$({ parent: $r2, text: 'Name', class: 'form-label' })
        this.nameEl = $$({ parent: $r2, el: 'input', class: 'form-input' });
        var $r3 = $$({ parent: this.el, class: 'row' });
        $$({ parent: $r3, text: 'Description', class: 'form-label' })
        this.descriptionEl = $$({ parent: $r3, el: 'textarea', class: 'form-textarea' });
        var $r4 = $$({ parent: this.el, class: 'row' });
        $$({ parent: $r4, text: 'Color', class: 'form-label' })
        this.colors = new Colors($r4);

        //
        this.closeButton.addEventListener('click', e => { this.parent.remove(this); });
        this.colors.addListener('change', this.setValueFromUi.bind(this));
        this.nameEl.addEventListener('keyup', this.setValueFromUi.bind(this));
        this.descriptionEl.addEventListener('keyup', this.setValueFromUi.bind(this));
    }

    setValueFromUi() {
        clearTimeout(this.callSaveId);
        this.callSaveId = setTimeout(() => {
            if (this.isSaving) {
                this.setValueFromUi();
            } else {
                this.isSaving = true;
                this.value = {
                    id: this.value ? this.value.id : null,
                    // type: this.typeEl.options[this.typeEl.selectedIndex].text,
                    name: this.nameEl.value,
                    description: this.descriptionEl.value,
                    color: this.colors.value
                }
                this.parent.services.Picker.Update(this.value).then(results => {
                    this.value.id = results.data.id;
                    this.redraw();
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
            this.colors.value = this.value.color;
            this.colors.redraw();
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