export class Component {
    constructor(el_options) {
        this.parent = null;
        this.listeners = {};
        this.el = $$(el_options);
        this.value = null;
    }

    draw() { console.log('needs definition') }
    redraw() { this.draw() }

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
}

export class List extends Component {
    constructor(el_options, cell_class, add_class) {
        super(el_options);
        this.value = [];
        this.renderer = cell_class;
        this.renderer_add = add_class;
    }
    draw() {
        this.el.innerHTML = '';
        this.children = [];
        this.value.forEach((v, index) => {
            var item = new this.renderer(this, v);
            this.children.push(item);
        });
        new this.renderer_add(this);
    }
}

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

export function format(str, color, parent) {
    return $$({ el: 'span', text: str, parent: parent, color: color });
}

