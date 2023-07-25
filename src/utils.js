

export function $(id) {
    return document.getElementById(id);
}

export function $$(o) {
    if (o == null)
        o = {};
    if (o.el == null)
        o.el = 'div';
    var $t = document.createElement(o.el);
    if (o.text)
        $t.appendChild(document.createTextNode(o.text));
    if (o.color)
        $t.style.color = o.color;
    if (o.backgroundColor)
        $t.style.backgroundColor = o.backgroundColor;
    if (o.class)
        $t.setAttribute('class', o.class);
    if (o.id)
        $t.setAttribute('id', o.id);
    if (o.type)
        $t.setAttribute('type', o.type);
    if (o.value)
        $t.setAttribute('value', o.value);
    if (o.click)
        $t.addEventListener('click', o.click);
    if (o.parent)
        o.parent.appendChild($t);
    return $t;
}

export function $$mi(o) {
    if (o.class) {
        o.class = 'material-symbols-outlined ' + o.class;
    } else {
        o.class = 'material-symbols-outlined';
    }
    o.type = 'span';
    return $$(o)
}

export function $$sel(o) {
    o.el = 'select';
    var $sel = $$(o);
    for (var i = 0; i < o.options.length; i++) {
        var $o = $$({ parent: $sel, el: 'option', text: o.options[i] });
    }
    return $sel;
}

export function format(str, color, parent) {
    return $$({ el: 'span', text: str, parent: parent, color: color });
}




export class Component {
    constructor(el_options, parent) {
        this.parent = parent;
        this.listeners = {};
        this.el = $$(el_options);
        this.value = null;
    }

    draw() { }
    redraw() { }

    visible(b, el = null) {
        if (el == null)
            el = this.el;
        el.style.display = b ? '' : 'none';
    }

    addListener(type, func) {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        this.listeners[type].push(func);
    }

    emit(type, value) {
        var funcs = this.listeners[type];
        if (funcs) {
            for (var i = 0; i < funcs.length; i++) {
                funcs[i](value, this);
            }
        }
    }

    remove(c) {
        c.el.remove();
        if (this.children) {
            var idx = this.children.indexOf(c);
            if (idx == -1) {
                return;
            }
            this.children.splice(idx, 1);
        }
    }

}




export class List extends Component {
    constructor(el_options, cell_class) {
        super(el_options);
        this.value = [];
        this.children = [];
        this.renderer = cell_class;
    }
    draw() {
        this.el.innerHTML = '';
        this.value.forEach((v, index) => {
            var item = new this.renderer(this, v);
            item.addListener('change', (e) => {
                this.emit('select');
            });
            item.addListener('click', (e) => {
                this.emit('click', index);
            })
            this.children.push(item);
        });
       
    }
    getIndexById(id) {
        for (var i = 0; i < this.value.length; i++) {
            if (this.value[i].id == id) {
                return i;
            }
        }
        return -1;
    }
    remove(id) {
        var i = this.getIndexById(id);
        this.value.splice(i, 1);
        this.draw();
    }
    update(data, orderField) {
        var i = this.getIndexById(data.id);
        if (i == -1) {
            this.value.push(data);
        } else {
            this.value[i] = data;
        }
        this.value.sort((a, b) => (a[orderField] > b[orderField]) ? 1 : -1)
        this.draw();
    }
    getSelected() {
        var c = [];
        this.children.forEach((item, index) => {
            if (item.toggle && item.toggle.value) {
                c.push(item.value);
            }
        });
        return c;
    }
    selectable(b) {
        this.children.forEach((item, index) => {
            item.selectable(b);
        });
    }
    draggable(b) {
        this.children.forEach((item, index) => {
            item.draggable(b);
        });
    }
}




export class Toggle extends Component {
    constructor(parent) {
        super({ parent: parent.el, class: 'toggle-component' }, parent);
        this.value = false;
        this.draw();
        this.redraw();
    }
    toggle() {
        this.value = !this.value;
        this.redraw();
    }
    draw() {
        this.selectEl = $$({ parent: this.el, class: 'container' });
        this.selectedEl = $$({ parent: this.el, class: 'signifier' });
        var self = this;
        this.selectEl.addEventListener('click', () => {
            self.toggle();
            self.emit('change', self.value);
        });
        this.selectedEl.addEventListener('click', () => {
            self.toggle();
            self.emit('change', self.value);
        });
    }
    redraw() {
        this.selectedEl.style.visibility = this.value ? 'visible' : 'hidden';
    }
}


export class Selected extends Component {
    constructor(options, values, renderer) {
        super(options);
        this.values = values;
        this.renderer = renderer;
        this.draw();
    }

    draw() {
        this.children = [];
        this.values.forEach((value, index) => {
            var c = new this.renderer(this, value);
            c.addListener('click', e => {
                this.value = value;
                this.emit('change', value);
                this.redraw();
            });
            this.children.push(c);
        });
    }

    redraw() {
        this.children.forEach(c => {
            c.selected = (c.value == this.value);
            c.redraw();
        });
    }
}
