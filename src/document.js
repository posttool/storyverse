import { FORTUNES } from './prompts'

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
            if (frame.setting)
                uniqueCharacters[frame.setting] = frame;
        });
        return uniqueCharacters;
    }

    toSimpleObject() {
        var unique = this.getUniqueNouns();
        var lastFrame = 0;
        this.frames.forEach((frame, index) => {
            if (frame.characters.length != 0) {
                lastFrame = index;
            }
        });
        return {
            title: this.title,
            framework: this.framework,
            tone: this.tone,
            characters: Object.keys(unique).map(id => {
                return {
                    id: this.nouns[id].id,
                    name: this.nouns[id].name,
                    description: this.nouns[id].description
                }
            }),
            frames: this.frames.slice(0, lastFrame+1).map(frame => {
                return {
                    index: (frame.index + 1),
                    setting: frame.setting ? this.nouns[frame.setting].name : 'None specified',
                    characters: frame.characters.map(character => {
                        var conflictType = (character.conflict == '-1' || character.conflict == null) ? null :
                            (character.id == character.conflict) ? 'Internal' : 'External';
                        return {
                            name: this.nouns[character.id].name,
                            fortune: FORTUNES[character.fortune].name,
                            conflict: conflictType,
                            conflictName: (conflictType == 'External') ? this.nouns[character.conflict].name : null
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

    removeCharacter(id){
        for (var i = 0; i < this.characters.length; i++) {
            if (this.characters[i].id == id) {
                this.characters.splice(i, 1);
                return;
            }
        }
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