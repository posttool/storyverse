export function random(a) {
    return Math.floor(Math.random() * a);
}

export function oneOf(array) {
    if (array && array.length != 0)
        return array[random(array.length)];
    else
        return {};
}

export function getByName(array, name) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].name == name) {
            return array[i];
        }
    };
    return null;
}

export function bezierCurve(ctx, points, f, t) {
    if (typeof (f) == 'undefined') f = 0.3;
    if (typeof (t) == 'undefined') t = 0.6;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    var m = 0;
    var dx1 = 0;
    var dy1 = 0;

    var dx2 = 0;
    var dy2 = 0;

    var preP = points[0];

    for (var i = 1; i < points.length; i++) {
        var curP = points[i];
        var nexP = points[i + 1];
        if (nexP) {
            m = (nexP.y - preP.y) / (nexP.x - preP.x);
            dx2 = (nexP.x - curP.x) * -f;
            dy2 = dx2 * m * t;
        } else {
            dx2 = 0;
            dy2 = 0;
        }

        ctx.bezierCurveTo(
            preP.x - dx1, preP.y - dy1,
            curP.x + dx2, curP.y + dy2,
            curP.x, curP.y
        );

        dx1 = dx2;
        dy1 = dy2;
        preP = curP;
    }
    ctx.stroke();
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
export function div(parentEl, className, text) {
    return $$({ parent: parentEl, class: className, text: text });
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




export class DbItemList extends Component {
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

    getValueById(id) {
        return this.value[this.getIndexById(id)];
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

    select(doc) {
        if (this.children.length == 0) {
            return;
        }
        if (doc == null || doc.id == null) {
            doc = this.children[0].value;
        }
        var s = '';
        var c = 0;
        this.children.forEach(child => {
            let b = (child.value.id == doc.id);
            child.select(b);
            s += b +" ";
            if (b) c++;
        });
        console.log(c+" "+s)
    }

}




// export class Toggle extends Component {
//     constructor(parent) {
//         super({ parent: parent.el, class: 'toggle-component' }, parent);
//         this.value = false;
//         this.draw();
//         this.redraw();
//     }
//     toggle() {
//         this.value = !this.value;
//         this.redraw();
//     }
//     draw() {
//         this.selectEl = $$({ parent: this.el, class: 'container' });
//         this.selectedEl = $$({ parent: this.el, class: 'signifier' });
//         var self = this;
//         this.selectEl.addEventListener('click', () => {
//             self.toggle();
//             self.emit('change', self.value);
//         });
//         this.selectedEl.addEventListener('click', () => {
//             self.toggle();
//             self.emit('change', self.value);
//         });
//     }
//     redraw() {
//         this.selectedEl.style.visibility = this.value ? 'visible' : 'hidden';
//     }
// }


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
