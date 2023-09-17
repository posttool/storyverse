import * as THREE from 'three';

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
export class Timeline {
    constructor() {
        this.cameraY = new MPoint(2, .002);
        this.cameraLookAt = new THREE.Vector3(0, 0, 0);
        this.timeZ = new MPoint(0, .4);
        this.frameSize = 20;

        this.setupScene();
        this.draw();
        this.setupRenderer();
        this.cameraY.destination = 10;
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 10, 400);
        this.camera.position.z = 100;
        this.scene.add(this.camera);

        var dlight = new THREE.DirectionalLight(0xffffff, 10);
        dlight.position.set(0, 3, 90);
        this.scene.add(dlight);

        this.debug = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 2),
            new THREE.MeshLambertMaterial({ color: "white" })
        );
        this.scene.add(this.debug);

        this.disc = new Disc(0x00ff00);
        this.scene.add(this.disc);
    }

    setupRenderer() {
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        // renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setAnimationLoop(animation);

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
            self.timeZ.destination++;
        }

        renderer.domElement.style.position = "absolute";
        renderer.domElement.style.top = 0;
        renderer.domElement.style.left = 0;
        renderer.domElement.style.zIndex = -1;

        document.body.appendChild(renderer.domElement);
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        // document.addEventListener('click', onDocumentClick, false);
    }

    getIntersections() {
        var vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 1);
        vector.unproject(this.camera);
        this.debug.position.set(vector.x, vector.y + 2, vector.z);
        if (this.lastIntersections) {
            this.lastIntersections.forEach(i => {
                i.object.material.opacity = .1;
            });
        }

        var ray = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());
        var intersects = ray.intersectObjects(this.rollovers);

        if (intersects.length > 0) {
            let lane, frame;
            intersects.forEach(i => {
                i.object.material.opacity = 1;

                var oo = i.object.parent.parent;
                if (oo instanceof Frame) {
                    frame = oo;
                } else if (oo instanceof Lane) {
                    lane = oo;
                }
            });

            this.lastIntersections = intersects;

            if (this.data) {
                console.log(this.data)
                if (lane && frame) {
                    this.disc.set(lane.color, this.data.icon);
                    console.log(lane.position.x+" "+frame.position.z);
                    this.disc.position.set(lane.position.x, -4.5, frame.position.z);
                }
            }

        }
       
    }

    update(time) {
        this.getIntersections();
        this.camera.position.y = this.cameraY.next();
        this.camera.lookAt(this.cameraLookAt);
        this.frames.position.z = this.timeZ.next() * this.frameSize;
    }

    draw() {
        this.rollovers = [];
        var c = [0x67dd00, 0xda0036, 0xefff4c, 0x86bbef, 0xf200c5]
        var e = ['amazed-face.png', 'amusing-face.png', 'anxious-face.png', 'baby-1.png', 'anguished-face.png'];
        var ef = ['woman-running-2.png', 'santa-claus-1.png', 'robot-face-3.png'];

        this.lanes = new THREE.Group();
        this.scene.add(this.lanes);

        for (let x = 0; x < 5; x++) {
            let f = new Lane(3, 1000, c[x], 'img/smiley-people/' + e[x])
            f.position.set(x * 5 - 10, -5, 100);
            this.lanes.add(f);
            this.rollovers.push(f.rollover);
        }

        this.frames = new THREE.Group();
        this.scene.add(this.frames);

        for (let i = 0; i < 10; i++) {
            let f = new Frame(29, this.frameSize);
            f.value = [{}]
            f.position.z = -i * this.frameSize;
            f.position.y = -4.5;
            this.frames.add(f);
            this.rollovers.push(f.rollover);
            // for fun
            let e1 = chooseOne(ef);
            let x = random(5);
            var d = new Disc(c[x], 'img/smiley-people/' + e1);
            d.position.set(x * 5 - 10, 0, 0);
            f.add(d);
        }
    }
}

class Disc extends THREE.Group{
    constructor(color, emojiPath) {
        super();
        this.set(color, emojiPath);
    }

    set(color, emojiPath) {
        if (color == this.color && emojiPath == this.emojiPath) {
            return;
        }
        for (var i = this.children.length - 1; i >= 0; i--) {
            let obj = this.children[i];
            this.remove(obj);
        }
        if (color) {
            this.color = color;
            const cylinder = new THREE.Mesh(
                new THREE.CylinderGeometry(2, 2, .2, 32),
                new THREE.MeshPhongMaterial({ color: color }));
            this.add(cylinder);
        }
        if (emojiPath) {
            this.emojiPath = emojiPath;
            const texture = new THREE.TextureLoader().load(emojiPath);
            // texture.magFilter = THREE.NearestFilter;
            // texture.minFilter = THREE.NearestFilter;
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
            sprite.scale.set(2, 2, 1);
            sprite.position.set(0, 1, 0);
            this.add(sprite);
        }

    }

}

class Lane extends THREE.Group {
    constructor(w, h, c) {
        super();
        this.width = w;
        this.height = h;
        this.color = c;
        this.value = [];//{character: uid, fortune: int}
        this.draw();
    }

    draw() {
        this.box = new BoxWithOutline(this.width, this.height, this.color);
        this.add(this.box.object);
        this.rollover = this.box.rollover;
        const disc = new Disc(0x111111, 'img/smiley-people/alien.png');
        this.add(disc);
    }
}

class Frame extends THREE.Group {
    constructor(w, h) {
        super();
        this.width = w;
        this.height = h;
        this.value = [];//{character: uid, fortune: int}
        this.draw();
    }
    draw() {
        this.box = new BoxWithOutline(this.width, this.height, 0xffffff);
        this.add(this.box.object);
        this.rollover = this.box.rollover;
    }

}


class BoxWithOutline {
    constructor(w, h, c) {
        const squareShape = getSquareShape(w, h);

        const plane = new THREE.Mesh(
            new THREE.ShapeGeometry(squareShape),
            new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide, opacity: .1, transparent: true })
        )

        const geometryPoints = new THREE.BufferGeometry().setFromPoints(squareShape.getPoints());
        let line = new THREE.Line(geometryPoints, new THREE.LineBasicMaterial({ color: c, linewidth: 3 }));
        let line2 = new THREE.Line(geometryPoints, new THREE.LineBasicMaterial({ color: c, linewidth: 3 }));
        line2.position.x = .02;

        const group = new THREE.Group();
        group.add(plane);
        group.add(line);
        group.add(line2);
        group.rotation.set(Math.PI * .5, 0, 0);
        group.position.set(-w / 2, 0, -h);

        this.rollover = plane;
        this.object = group;
    }
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

