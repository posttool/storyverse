export class Document {
    constructor() {
        this.nouns = {};
        this.frames = [];
        this.title;
        this.framework;
        this.tone;

        for (var i = 0; i < 7; i++) {
            this.addFrame(i);
        }
    }

    setNouns(v) {
        this.nouns = {};
        v.forEach(doc => {
            this.nouns[doc.id] = doc;
        });
    }

    setAttributes(o) {
        this.title = o.title;
        this.framework = o.framework;
        this.tone = o.tone;
    }

    addFrame(index) {
        this.frames.push(new FrameData(this, index));
    }

    getById(id) {
        return this.nouns[id];
    }

    getUniqueNouns() {
        var uniqueCharacters = {};
        this.frames.forEach(frame => {
            frame.characters.forEach(character => {
                if (!(character.id in uniqueCharacters)) {
                    uniqueCharacters[character.id] = frame;
                }
            });
        });
        return uniqueCharacters;
    }

    toSimpleObject() {
        var unique = this.getUniqueNouns();
        return {
            title: this.title,
            framework: this.framework,
            tone: this.tone,
            characters: Object.keys(unique).map(id => {
                return {
                    id: this.nouns[id].id,
                    name: this.nouns[id].name,
                }
            }),
            frames: this.frames.map(frame => {
                return {
                    index: (frame.index + 1),
                    characters: frame.characters.map(character => {
                        return {
                            name: this.nouns[character.id].name,
                            fortune: character.fortune,
                            conflict: character.conflict
                        }
                    })
                }
            })
        };
    }
}

export class FrameData {
    constructor(document, index) {
        this.document = document;
        this.index = index;
        this.characters = [];
        this.setting = null;
    }

    addCharacter(id, fortune, conflict) {
        this.characters.push(new CharacterData(this, id, fortune, conflict));
    }

    getByFortune(fortune) {
        var list = [];
        for (var i = 0; i < this.characters.length; i++) {
            if (this.characters[i].fortune == fortune) {
                list.push(this.characters[i].id);
            }
        }
        return list;
    }

    getById(id) {
        for (var i = 0; i < this.characters.length; i++) {
            if (this.characters[i].id == id) {
                return this.characters[i];
            }
        }
        return null;
    }

    getIds() {
        var map = {};
        for (var i = 0; i < this.characters.length; i++) {
            map[this.characters[i].id] = true;
        }
        return Object.keys(map);
    }
}

export class CharacterData {
    constructor(frame, id, fortune, conflict) {
        this.frame = frame;
        this.id = id; //doc id
        this.fortune = fortune;
        this.conflict = conflict; //null/-1 or doc id
    }

    doc() {
        return this.frame.document.getById(this.id);
    }
}