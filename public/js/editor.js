
class Component {
    constructor(el_options) {
        this.parent = null;
        this.listeners = {};
        this.el = $$(el_options);
        this.value = null;
    }


    draw() { }
    redraw() { }

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

class Storyline extends Component {
    constructor(rootEl) {
        super({ parent: rootEl, class: 'storyline' });
        this.sections = [];
        this.targets = {};
        this.draw();
    }

    draw() {
        var $climax = $$({ class: 'timeline-climax', parent: this.el });
        this.midEl = $$({ class: 'timeline-mid', parent: this.el });
        var $labels = $$({ class: 'timeline-labels', parent: this.midEl })
        $$({ class: 'major', parent: $labels, text: 'Main' })
        $$({ class: 'minor', parent: $labels, text: 'Minor' })
        $$({ class: 'major-line', parent: $labels })
        $$({ class: 'minor-line', parent: $labels })
        this.addSection(new StorylineSection(this, 'Beginning'));
        this.addSection(new StorylineSection(this, 'Middle'));
        this.addSection(new StorylineSection(this, 'End'));
        this._addDragger(0, 1);
        this._addDragger(1, 2);
    }

    addSection(section) {
        var self = this;
        self.sections.push(section);
        section.addListener('change', (e) => {
            self.redraw(section);
        })
    }

    redraw(section) {
        if (section) {
            section.redraw();
        } else {
            this.sections.forEach(section => {
                section.redraw();
            });
        }
    }

    _addDragger(leftIdx, rightIdx) {
        var leftEl = this.sections[leftIdx].el;
        var rightEl = this.sections[rightIdx].el;
        var clickX = 0, leftW = 0, rightW = 0;
        var $s = $$({ class: 'dragger' });
        leftEl.after($s);
        function _dragging(e) {
            var d = (e.screenX - clickX);
            if (leftW + d < 70 || leftW + d > 270) {
                return;
            }
            leftEl.style.width = (leftW + d) + 'px'
            rightEl.style.width = (rightW - d) + 'px'
        }
        $s.addEventListener('mousedown', (e) => {
            leftW = leftEl.offsetWidth;
            rightW = rightEl.offsetWidth;
            clickX = e.screenX;
            window.document.addEventListener('mousemove', _dragging)
        })
        window.document.addEventListener('mouseup', (e) => {
            window.document.removeEventListener('mousemove', _dragging);
        })
    }

    addTarget(t) {
        var self = this;
        self.targets[t.uuid] = t;
        t.addListener('change', (t) => {
            self.redraw(t.parent);
        })
    }

    getTarget(uuid) {
        return this.targets[uuid];
    }
}

class StorylineSection extends Component {
    constructor(parent, name) {
        super({ class: 'section', parent: parent.midEl });
        this.parent = parent;
        this.name = name;
        this.value = { index: -1 }; // the scrapbook index for the 'setting' of this section
        this.targets = []; // the main & minor characters
        this.draw();
    }

    addTarget(t) {
        var self = this;
        self.targets.push(t);
        self.parent.addTarget(t);
    }

    draw() {
        var $drop = $$({ parent: this.el });
        $$({ class: 'top', parent: $drop });
        $$({ class: 'right', parent: $drop });
        $$({ class: 'bottom', parent: $drop });
        $$({ class: 'left', parent: $drop });
        this.labelEl = $$({ class: 'label', parent: this.el, text: this.name });
        this.addTarget(new Target(this, 'major-container'));
        this.addTarget(new Target(this, 'minor-container'));
        this.descriptionEl = $$({ class: 'description', parent: this.el, text: '' });

        // DnD setup
        var self = this;
        $drop.addEventListener('drop', (e) => {
            e.preventDefault();
            self.value.index = Number(e.dataTransfer.getData('idx'));
            self.emit('change', this);
        });
        $drop.addEventListener('dragover', (e) => {
            e.preventDefault();
            return false;
        });
    }

    redraw() {
        var c00 = this.targets[0].value.index;
        var c01 = this.targets[1].value.index;

        var do1 = SB[c01];
        var do2 = SB[c00];
        var do3 = SB[this.value.index];
        this.labelEl.innerText = this.name;
        // build label (todo call service for results)
        var $ft = $$({ el: 'span' });
        if (c00 == -1 && c01 == -1) {
            format('No one ', null, $ft);
        } else if (c00 == -1 && c01 != -1) {
            format('Minor ', null, $ft);
            format(do1.name, do1.color, $ft);
        } else if (c00 != -1 && c01 == -1) {
            format('Main ', null, $ft);
            format(do2.name, do2.color, $ft);
        } else {
            format('Main ', null, $ft);
            format(do2.name, do2.color, $ft);
            format(' and minor ', null, $ft);
            format(do1.name, do1.color, $ft);
        }
        if (do3) {
            this.el.style.backgroundColor = do3.color + "33";
            format(' in setting ', null, $ft);
            format(do3.name, do3.color, $ft);
        }
        this.descriptionEl.innerHTML = '';
        this.descriptionEl.appendChild($ft);

        this.targets.forEach(target => {
            target.redraw();
        });
    }


}

class Target extends Component {
    constructor(parent, name) {
        super({ parent: parent.el });
        this.parent = parent;
        this.name = name;
        this.value = { index: -1, size: 1 };
        this.uuid = Math.floor(Math.random() * Date.now()).toString(16);
        this.draw();
    }

    draw() {
        var self = this;
        var $c1 = $$({ class: this.name, parent: this.el });
        $$({ class: 'major', parent: $c1 });
        $$({ class: 'major1', parent: $c1 });
        $$({ class: 'major2', parent: $c1 });
        self.$c13 = $$({ class: 'char', parent: $c1 });
        // DnD handling
        // the largest dot can be dropped on
        $c1.addEventListener('drop', (e) => {
            e.preventDefault();
            self.value = {
                index: Number(e.dataTransfer.getData('idx')),
                size: -1
            };
            var origin_target = self.parent.parent.getTarget(e.dataTransfer.getData('originTargetId'));
            if (origin_target) {
                origin_target.value.index = -1;
                origin_target.emit('change', origin_target);
            }
            self.redraw();
            self.emit('change', this);
        });
        $c1.addEventListener('dragover', (e) => {
            e.preventDefault();
            return false;
        });
        // the dot is draggable
        self.$c13.draggable = "true";
        self.$c13.addEventListener('dragstart', (e) => {
            self.$c13.style.opacity = '0.4';
            e.dataTransfer.setData('idx', self.value.index);
            e.dataTransfer.setData("originTargetId", self.uuid);
        });
        self.$c13.addEventListener('dragend', (e) => {
            self.redraw(); // TODO handle situ where item wasnt dropped on a valid target
        });
    }

    redraw() {
        if (this.value.index == -1) {
            this.$c13.style.opacity = 0;
        } else {
            this.$c13.style.backgroundColor = SB[this.value.index].color;
            this.$c13.style.opacity = 1;
        }
    }

}


