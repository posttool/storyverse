import { $,  $$, $$mi, format, Component, List } from './utils.js';


export class Picker extends Component {
    constructor(parent) {
        super({ parent: $('picker'), class: 'picker' });
        this.parent = parent;
        this.collapsed = false;
        this.draw();
        this.objects = new List({ parent: this.el, class: 'picker-list' }, PickerCell, PickerAddCell);
    }

    draw() {
        this.el.innerHTML = '';
        this.toolbarEl = $$({parent: this.el, class: 'picker-toolbar'});
        this.titleEl = $$({parent: this.toolbarEl, class: 'title', text: 'Power Picker'});
        this.delEl = $$mi({parent: this.toolbarEl, class: 'button-delete', text: 'delete'});
        this.collapseEl = $$mi({parent: this.toolbarEl, class: 'button-collapse', text: 'chevron_left'});
    }

}

export class PickerCell extends Component {
    constructor(list, value) {
        super({ parent: list.el, class: 'picker-cell' });
        this.value = value;
        this.draw();
    }

    draw() {
        this.titleEl = $$({parent: this.el, class: 'icon'});
        this.titleEl.style.backgroundColor = this.value.color;
        this.textEl = $$({parent: this.el, class: 'textc'});
        $$({parent: this.textEl, class: 'text', text: this.value.name})
        $$({parent: this.textEl, class: 'text2', text: this.value.type})
        this.selectEl = $$({parent: this.el, class: 'select'});
    }
}

export class PickerAddCell extends Component {
    constructor(list) {
        super({ parent: list.el, class: 'picker-cell' });
        this.draw();
    }

    draw() {
        this.titleEl = $$({parent: this.el, class: 'icon'});
        this.titleEl.style.color = "black"
        $$mi({parent: this.titleEl, text: 'add_circle'});
        this.textEl = $$({parent: this.el, class: 'textc'});
        $$({parent: this.textEl, class: 'text', text: 'Add a new place, thing...'})
        $$({parent: this.textEl, class: 'text2', text: 'Grab whatever'})
    }
}