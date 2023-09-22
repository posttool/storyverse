import * as THREE from 'three';
import { ICON_BASEPATH } from './icons';
import { Component } from './utils';

class MPoint {
    constructor(initValue, speed = .1) {
        this.at = initValue;
        this.destination = initValue;
        this.speed = speed;
    }
    next() {
        this.at += (this.destination - this.at) * this.speed;
        return this.at;
    }
}

// init
export const MODE_PLACING = 0;
export const MODE_SELECTING = 1;

export class Timeline extends Component {
    constructor() {
        super({ parent: document.body })
        this.cameraY = new MPoint(2, .002);
        this.cameraY.destination = 11;
        this.cameraLookAt = new THREE.Vector3(0, 0, -10);
        this.timeZ = new MPoint(0, .4);
        this.frameSize = 20;

        this.mode = MODE_PLACING;

        this.setupScene();
        this.draw();
        this.setupRenderer();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 10, 400);
        this.camera.position.z = 70;
        this.scene.add(this.camera);
        // var dlight = new THREE.AmbientLight(0xffffff, 2);
        var dlight = new THREE.DirectionalLight(0xffffff, 10);
        dlight.position.set(0, 3, 90);
        this.scene.add(dlight);

        // this.debug = new THREE.Mesh(
        //     new THREE.BoxGeometry(2, 2, 2),
        //     new THREE.MeshLambertMaterial({ color: "white" })
        // );
        // this.scene.add(this.debug);

        this.disc = new Disc(0x00ff00);
        this.disc.visible = false;
        this.scene.add(this.disc);
    }

    setupRenderer() {
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
        renderer.setAnimationLoop(animation);
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        // animation & mouse handling
        var self = this;
        function animation(time) {
            self.update(time);
            renderer.render(self.scene, self.camera);
        }

        self.mouse = { x: -10000, y: -10000 };
        function onDocumentMouseMove(e) {
            self.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            self.mouse.y = (e.clientY / window.innerHeight) * -2 + 1;
        }
        function onDocumentClick(e) {
            self.onClick();
        }

        renderer.domElement.style.position = "absolute";
        renderer.domElement.style.top = 0;
        renderer.domElement.style.left = 0;
        renderer.domElement.style.zIndex = -1;

        document.body.appendChild(renderer.domElement);
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('click', onDocumentClick, false);
    }

    onClick() {
        if (this.mode == MODE_PLACING) {
            this.getIntersections();
            if (this.data && this.frame && this.lane) {
                this.frame.addCharacter(this.data, this.lane.fortune);
                this.renderFortuneCurves();
            } else if (this.data && this.frame && this.setting) {
                this.frame.addSetting(this.data);
            }
            console.log('3')

        } else {
            if (this.frame && this.lane)
                this.emit('select', {
                    frame: this.frame.index,
                    fortune: this.lane.fortune,
                    characters: this.frame.getByFortune(this.lane.fortune)
                });
        }
    }


    draw() {
        this.rollovers = [];

        this.lanes = new THREE.Group();
        this.scene.add(this.lanes);

        for (let x = 0; x < 5; x++) {
            let f = new Lane(x, 3, 250, COLORS[x], ICON_BASEPATH + EMOJIS[x])
            f.position.set(x * 5 - 10, 0, 0);
            this.lanes.add(f);
            this.rollovers.push(f.rollover);
        }

        this.frames = new THREE.Group();
        this.scene.add(this.frames);

        for (let i = 0; i < 10; i++) {
            let f = new Frame(i, 29, this.frameSize);
            f.position.z = -i * this.frameSize;
            f.position.y = .5;
            this.frames.add(f);
            this.rollovers.push(f.rollover);
            this.rollovers.push(f.rolloverSetting);
        }

        this.curves = new THREE.Group();
        this.scene.add(this.curves);
    }

    renderFortuneCurves() {
        clearGroup(this.curves);

        var uniqueChars = this.getUniqueCharacters();
        for (var j = 0; j < uniqueChars.length; j++) {
            var discs = this.getDiscsByCharacter(uniqueChars[j]);
            if (discs.length < 2)
                continue;
            var vectors = [];
            for (var i = 0; i < discs.length; i++) {
                var target = new THREE.Vector3();
                discs[i].getWorldPosition(target)
                target.z -= this.timeZ.destination * this.frameSize
                vectors.push(target);
            }
            const curve = new THREE.CatmullRomCurve3(vectors);
            const points = curve.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ color: 0xffffff });
            const splineObject = new THREE.Line(geometry, material);
            this.curves.add(splineObject);
        }
    }

    getIntersections() {
        var vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 1);
        vector.unproject(this.camera);
        // this.debug.position.set(vector.x, vector.y, vector.z);

        if (this.lastIntersections) {
            this.lastIntersections.forEach(i => {
                i.object.parent.parent.hilight(false);
            });
        }

        this.lane = null;
        this.frame = null;

        var ray = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());
        var intersects = ray.intersectObjects(this.rollovers);

        if (intersects.length > 0) {
            intersects.forEach(i => {
                var oo = i.object.parent.parent;
                oo.hilight(true);
                if (oo instanceof Frame) {
                    this.frame = oo;
                    this.setting = (i.object.userData == 'setting');
                } else if (oo instanceof Lane) {
                    this.lane = oo;
                }
            });
        }

        if (this.lastIntersections != intersects) {
            this.redraw();
        }

        this.lastIntersections = intersects;

    }

    redraw() {
        if (this.mode == MODE_PLACING &&
            this.data && this.lane && this.frame &&
            inObjArrayWithId(this.frame.getByFortune(this.lane.fortune), this.data) == -1) {
            this.disc.set(this.lane.color, this.data.icon);
            this.disc.position.set(this.lane.position.x, 1,
                this.frame.position.z - (this.frameSize / 2) + this.timeZ.destination * this.frameSize);
            this.disc.cylinder.material.opacity = .5;
            if (this.disc.sprite)
                this.disc.sprite.material.opacity = .7;
            this.disc.visible = true;
        } else {
            this.disc.visible = false;
        }

        if (this.mode == MODE_PLACING &&
            this.data && this.frame && this.setting &&
            this.frame.setting != this.data) {
            this.disc.set(0, this.data.icon);
            this.disc.position.set(this.frame.position.x + this.frame.width / 2,
                this.frame.position.y,
                this.frame.position.z + this.frame.height/2);
            this.disc.cylinder.material.opacity = 0;
            if (this.disc.sprite)
                this.disc.sprite.material.opacity = .7;
            this.disc.visible = true;
        }
    }

    update(time) {
        this.getIntersections();
        this.camera.position.y = this.cameraY.next();
        this.camera.lookAt(this.cameraLookAt);
        this.frames.position.z = this.timeZ.next() * this.frameSize;
        this.curves.position.z = this.frames.position.z;
    }


    gotoFrame(d) {
        this.timeZ.destination = d;
    }


    //returns the unique characters by looking at all the frames
    getUniqueCharacters() {
        var map = {};
        for (var i = 0; i < this.frames.children.length; i++) {
            var ids = this.frames.children[i].getIds();
            for (var j = 0; j < ids.length; j++) {
                map[ids[j]] = true;
            }
        }
        return Object.keys(map);
    }

    //returns a list of a single character through frames.
    getDiscsByCharacter(id) {
        var discs = [];
        for (var i = 0; i < this.frames.children.length; i++) {
            var d = this.frames.children[i].getDisc(id);
            if (d)
                discs.push(d);
        }
        return discs;
    }


}


class UX3D extends THREE.Group {
    constructor() {
        super();
    }

    clear(g) {
        clearGroup(g ? g : this);
    }
}

function clearGroup(o) {
    for (var i = o.children.length - 1; i >= 0; i--) {
        let obj = o.children[i];
        o.remove(obj);
    }
}

class Disc extends UX3D {
    constructor(color, emojiPath) {
        super();
        this.set(color, emojiPath);
    }

    set(color, emojiPath) {
        if (color == this.color && emojiPath == this.emojiPath) {
            return;
        }
        this.clear();
        if (color != null) {
            this.color = color;
            this.cylinder = new THREE.Mesh(
                new THREE.CylinderGeometry(2, 2, .4, 32),
                new THREE.MeshPhongMaterial({ color: color, transparent: true }));
            this.cylinder.position.set(0, 0, 0);
            this.add(this.cylinder);
        }
        if (emojiPath) {
            this.emojiPath = emojiPath;
            this.sprite = getSprite(emojiPath);
            this.sprite.position.set(0, 1.5, 0);
            this.add(this.sprite);
        }

    }

}

class Lane extends UX3D {
    constructor(fortune, w, h, c, e) {
        super();
        this.fortune = fortune;
        this.width = w;
        this.height = h;
        this.color = c;
        this.emoji = e;
        this.draw();
    }

    draw() {
        this.box = new BoxWithOutline(this.width, this.height, this.color);
        this.box.rotation.set(Math.PI * .5, 0, 0);
        this.box.position.set(-this.width / 2, 0, -this.height);
        this.add(this.box);

        const texture = getTexture(this.emoji);
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(3, 3),
            new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide, opacity: 1, transparent: true })
        );

        plane.rotation.set(-Math.PI * .5, 0, 0);
        plane.position.set(0, .01, -40);
        this.add(plane);

        this.rollover = this.box.rollover;
    }

    hilight(b) {
        this.box.rollover.material.opacity = b ? .8 : .1;
    }
}

class Frame extends UX3D {
    constructor(i, w, h) {
        super();
        this.index = i;
        this.width = w;
        this.height = h;
        this.characters = [];//{data: {id: uuid, ...}, fortune: int}
        this.setting = null; //data
        this.draw();
    }

    draw() {
        this.box = new BoxWithOutline(this.width, this.height, 0xffffff);
        this.box.rotation.set(Math.PI * .5, 0, 0);
        this.box.position.set(-this.width / 2, 0, -this.height);
        this.add(this.box);
        this.boxSetting = new BoxWithOutline(3, 3, 0xffffff);
        this.boxSetting.position.set(this.width / 2 , -1.5, 0);
        this.add(this.boxSetting);

        this.rollover = this.box.rollover;
        this.rolloverSetting = this.boxSetting.rollover;
        this.rolloverSetting.userData = 'setting';
        this.g = new THREE.Group(); // used to draw values
        this.add(this.g);
    }

    redrawCharacters() {
        this.clear(this.g);
        this.characters.forEach((info, index) => {
            var d = new Disc(getColor(info.fortune), info.data.icon);
            d.userData = info.data.id;
            d.position.set(info.fortune * 5 - 10, .1, -index * 5);
            this.g.add(d);
        });
    }

    redrawSetting() {
        if (this.setting) {
            if (this.sprite) {
                this.boxSetting.remove(this.sprite);
            }
            this.sprite = getSprite(this.setting.icon);
            this.sprite.position.set(1.5,1.5,.1)
            this.boxSetting.add(this.sprite);
        }
    }

    hilight(b) {
        this.box.rollover.material.opacity = b ? .3 : .1;
    }

    addCharacter(data, fortune) {
        var match = this.getById(data.id);
        if (match) {
            match.fortune = fortune;
            match.data.icon = data.icon;
        } else {
            this.characters.push({ data: data, fortune: fortune });
        }
        this.redrawCharacters();
    }

    addSetting(data) {
        this.setting = data;
        this.redrawSetting();
    }

    getByFortune(fortune) {
        var list = [];
        for (var i = 0; i < this.characters.length; i++) {
            if (this.characters[i].fortune == fortune) {
                list.push(this.characters[i].data);
            }
        }
        return list;
    }

    getById(id) {
        for (var i = 0; i < this.characters.length; i++) {
            if (this.characters[i].data.id == id) {
                return this.characters[i];
            }
        }
        return null;
    }

    getIds() {
        var map = {};
        for (var i = 0; i < this.characters.length; i++) {
            map[this.characters[i].data.id] = true;
        }
        return Object.keys(map);
    }

    getDisc(id) {
        for (var i = 0; i < this.g.children.length; i++) {
            if (this.g.children[i].userData == id) {
                return this.g.children[i];
            }
        }
        return null;
    }


}


class BoxWithOutline extends THREE.Group {
    constructor(w, h, c, e) {
        super();
        const squareShape = getSquareShape(w, h);

        const plane = new THREE.Mesh(
            new THREE.ShapeGeometry(squareShape),
            new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide, opacity: .1, transparent: true })
        )

        const geometryPoints = new THREE.BufferGeometry().setFromPoints(squareShape.getPoints());
        let line = new THREE.Line(geometryPoints, new THREE.LineBasicMaterial({ color: c }));
        let line2 = new THREE.Line(geometryPoints, new THREE.LineBasicMaterial({ color: c }));
        line2.position.x = .02;

        this.add(plane);
        this.add(line);
        this.add(line2);

        this.rollover = plane;
    }
}

const textureLoader = new THREE.TextureLoader();
function getTexture(path, options) {
    const texture = textureLoader.load(path);
    // texture.magFilter = THREE.NearestMipmapNearestFilter;
    // texture.minFilter = THREE.NearestMipmapNearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
}

function getSprite(path) {
    const texture = getTexture(path);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
    sprite.scale.set(2, 2, 1);
    return sprite;
}

function getSquareShape(W, H) {
    return new THREE.Shape()
        .moveTo(0, 0)
        .lineTo(0, H)
        .lineTo(W, H)
        .lineTo(W, 0)
        .lineTo(0, 0);
}

function random(m) {
    return Math.floor(Math.random() * m);
}

function chooseOne(a) {
    return a[random(a.length)];
}


const COLORS = [0x67dd00, 0xda0036, 0xefff4c, 0x86bbef, 0xf200c5]
const EMOJIS = ['crazy-face.png', 'grinning-face.png', 'face-without-mouth.png', 'confused-face.png', 'anxious-face.png'];
var ef = ['woman-running-2.png', 'santa-claus-1.png', 'robot-face-3.png'];


function getColor(fortune) {
    return COLORS[fortune];
}

function getEmoji(fortune) {
    return EMOJIS[fortune];
}


function inObjArrayWithId(array, obj) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].id == obj.id) {
            return i;
        }
    }
    return -1;
}
/*


    setUpMouseHander(canvas,doMouseDown,doMouseMove);
    setUpTouchHander(canvas,doMouseDown,doMouseMove);


*/



// function setUpMouseHander(element, mouseDownFunc, mouseDragFunc, mouseUpFunc) {
//     /*
//            element -- either the element itself or a string with the id of the element
//            mouseDownFunc(x,y,evt) -- should return a boolean to indicate whether to start a drag operation
//            mouseDragFunc(x,y,evt,prevX,prevY,startX,startY)
//            mouseUpFunc(x,y,evt,prevX,prevY,startX,startY)
//        */
//     if (!element || !mouseDownFunc || !(typeof mouseDownFunc == "function")) {
//         throw "Illegal arguments in setUpMouseHander";
//     }
//     if (typeof element == "string") {
//         element = document.getElementById(element);
//     }
//     if (!element || !element.addEventListener) {
//         throw "first argument in setUpMouseHander is not a valid element";
//     }
//     var dragging = false;
//     var startX, startY;
//     var prevX, prevY;

//     function doMouseDown(evt) {
//         if (dragging) {
//             return;
//         }
//         var r = element.getBoundingClientRect();
//         var x = evt.clientX - r.left;
//         var y = evt.clientY - r.top;
//         prevX = startX = x;
//         prevY = startY = y;
//         dragging = mouseDownFunc(x, y, evt);
//         if (dragging) {
//             document.addEventListener("mousemove", doMouseMove);
//             document.addEventListener("mouseup", doMouseUp);
//         }
//     }

//     function doMouseMove(evt) {
//         if (dragging) {
//             if (mouseDragFunc) {
//                 var r = element.getBoundingClientRect();
//                 var x = evt.clientX - r.left;
//                 var y = evt.clientY - r.top;
//                 mouseDragFunc(x, y, evt, prevX, prevY, startX, startY);
//             }
//             prevX = x;
//             prevY = y;
//         }
//     }

//     function doMouseUp(evt) {
//         if (dragging) {
//             document.removeEventListener("mousemove", doMouseMove);
//             document.removeEventListener("mouseup", doMouseUp);
//             if (mouseUpFunc) {
//                 var r = element.getBoundingClientRect();
//                 var x = evt.clientX - r.left;
//                 var y = evt.clientY - r.top;
//                 mouseUpFunc(x, y, evt, prevX, prevY, startX, startY);
//             }
//             dragging = false;
//         }
//     }
//     element.addEventListener("mousedown", doMouseDown);
// }

// function setUpTouchHander(element, touchStartFunc, touchMoveFunc, touchEndFunc, touchCancelFunc) {
//     /*
//            element -- either the element itself or a string with the id of the element
//            touchStartFunc(x,y,evt) -- should return a boolean to indicate whether to start a drag operation
//            touchMoveFunc(x,y,evt,prevX,prevY,startX,startY)
//            touchEndFunc(evt,prevX,prevY,startX,startY)
//            touchCancelFunc()   // no parameters
//        */
//     if (!element || !touchStartFunc || !(typeof touchStartFunc == "function")) {
//         throw "Illegal arguments in setUpTouchHander";
//     }
//     if (typeof element == "string") {
//         element = document.getElementById(element);
//     }
//     if (!element || !element.addEventListener) {
//         throw "first argument in setUpTouchHander is not a valid element";
//     }
//     var dragging = false;
//     var startX, startY;
//     var prevX, prevY;

//     function doTouchStart(evt) {
//         if (evt.touches.length != 1) {
//             doTouchEnd(evt);
//             return;
//         }
//         evt.preventDefault();
//         if (dragging) {
//             doTouchEnd();
//         }
//         var r = element.getBoundingClientRect();
//         var x = evt.touches[0].clientX - r.left;
//         var y = evt.touches[0].clientY - r.top;
//         prevX = startX = x;
//         prevY = startY = y;
//         dragging = touchStartFunc(x, y, evt);
//         if (dragging) {
//             element.addEventListener("touchmove", doTouchMove);
//             element.addEventListener("touchend", doTouchEnd);
//             element.addEventListener("touchcancel", doTouchCancel);
//         }
//     }

//     function doTouchMove(evt) {
//         if (dragging) {
//             if (evt.touches.length != 1) {
//                 doTouchEnd(evt);
//                 return;
//             }
//             evt.preventDefault();
//             if (touchMoveFunc) {
//                 var r = element.getBoundingClientRect();
//                 var x = evt.touches[0].clientX - r.left;
//                 var y = evt.touches[0].clientY - r.top;
//                 touchMoveFunc(x, y, evt, prevX, prevY, startX, startY);
//             }
//             prevX = x;
//             prevY = y;
//         }
//     }

//     function doTouchCancel() {
//         if (touchCancelFunc) {
//             touchCancelFunc();
//         }
//     }

//     function doTouchEnd(evt) {
//         if (dragging) {
//             dragging = false;
//             element.removeEventListener("touchmove", doTouchMove);
//             element.removeEventListener("touchend", doTouchEnd);
//             element.removeEventListener("touchcancel", doTouchCancel);
//             if (touchEndFunc) {
//                 touchEndFunc(evt, prevX, prevY, startX, startY);
//             }
//         }
//     }
//     element.addEventListener("touchstart", doTouchStart);
// }

