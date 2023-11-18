import { FORTUNES } from './prompts'

export class Document {
    constructor() {
        this.nouns = {};
        this.frames = [];
        this.title;
        this.subtitle;
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
        var f =new FrameData(this, index);
        this.frames.push(f);
        return f;
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
            frames: this.frames.slice(0, lastFrame + 1).map(frame => {
                return {
                    index: (frame.index + 1),
                    setting: frame.setting ? this.nouns[frame.setting].name : null,
                    characters: frame.characters.map(character => {
                        var conflictType = (character.conflict == null) ? null :
                            (character.id == character.conflict) ? 'internal' : 'external';
                        return {
                            id: character.id,
                            name: this.nouns[character.id].name,
                            fortune: FORTUNES[character.fortune].name,
                            fortune_index: character.fortune,
                            conflict: conflictType,
                            conflict_id: character.conflict,
                            conflictName: (conflictType == 'external') ? this.nouns[character.conflict].name : null
                        }
                    })
                }
            })
        };
    }

    fromJson(o) {
        this.title = o.title;
        this.subtitle = o.subtitle;
        this.framework = o.framework;
        this.tone = o.tone;
        this.frames = []
        o.frames.forEach((f,i)=>{
            var frame = this.addFrame(i);
            f.characters.forEach(c=>{
                frame.addCharacter(c.id, c.fortune_index, c.conflict_id);
            })
        });
        while (this.frames.length < 7) {
            this.addFrame(this.frames.length-1);
        }
    }
}

export class FrameData {
    constructor(document, index) {
        this.document = document;
        this.index = index;
        this.characters = [];
        this.setting = null;
        this.title = null;
        this.emoji = null;
        this.summary = null;
        this.setting_info = null;
        this.conflict_description = null;
}

    addCharacter(id, fortune, conflict) {
        this.characters.push(new CharacterData(this, id, fortune, conflict));
    }

    removeCharacter(id) {
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

    getByName(name) {
        for (var i = 0; i < this.characters.length; i++) {
            if (this.document.nouns[this.characters[i].id].name == name) {
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
        if (conflict == -1 || conflict == '-1') {
            conflict = null;
        }
        this.conflict = conflict; //null or doc id
        this.point_of_view = null;
        this.attitude = null;
        this.fortune_summary = null;
    }

    doc() {
        let doc = this.frame.document.getById(this.id);
        if (doc == null) {
            console.log('no '+this.id);
        }
        return doc;
    }
}

export class SettingData {
    constructor(frame, id,) {
        this.frame = frame;
        this.id = id; //doc id
        this.description = null;
        this.sentory_details = { feel: null, smell: null, sound: null, appearance: null };
    }

    doc() {
        return this.frame.document.getById(this.id);
    }
}