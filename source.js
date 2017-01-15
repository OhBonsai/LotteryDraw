/**
 * Created by bonsai on 1/14/17.
 */
var LuckyDog = function(name, id, groupId){
    this.name = name;
    this.id = id;
    this.groupId = groupId;
    this.object3D = this.createCard(name, id, groupId);
    this.luckyLevel = 0;
};

LuckyDog.prototype = {
    constructor: LuckyDog,
    createCard: function(){
        var card = document.createElement('div');
        card.id = this.name;
        card.className = 'card';
        card.style.backgroundColor = groupColor[this.groupId] + 1 + ')';

        var myName = document.createElement('div');
        myName.className = 'name';
        myName.textContent = this.name;
        card.appendChild(myName);

        var info = document.createElement('div');
        info.className = 'info';
        info.innerHTML = this.id + '<br>' + group[this.groupId];
        card.appendChild(info);

        var curObj = new THREE.CSS3DObject(card);
        curObj.position.x = Math.random() * 3000 - 1500;
        curObj.position.y = Math.random() * 3000 - 1500;
        curObj.position.z = Math.random() * 2000 - 1500;
        return curObj;
    },
    show: function(){
        document.getElementById(this.name).style.display = '';
        this.object3D.visible = true;
    },
    hide: function(){
        document.getElementById(this.name).style.display = 'none';
        this.object3D.visible = false;
    }
};

var LuckyGroup = function(ul, nl, ly){
    this.inChaos = false;
    this.chaosInterval = null;

    this.isViewLevel = false;

    this.newLuckyDogs = [];
    this.luckyDogs = [];
    this.unLuckyDogs = [];
    this.initDogs(ul, nl, ly);
};

LuckyGroup.prototype = {
    constructor: LuckyGroup,

    initDogs: function(ul, nl, ly){
        var _this = this;
        ul.forEach(function(o){
            _this.unLuckyDogs.push(new LuckyDog(o[0], o[1], o[2]))
        });
        nl.forEach(function(o){
            _this.newLuckyDogs.push(new LuckyDog(o[0], o[1], o[2]))
        });
        ly.forEach(function(o){
            _this.luckyDogs.push(new LuckyDog(o[0], o[1], o[2]))
        })
    },

    startDraw: function(){
        // log current state when start draw
        this.logCurState();

        this.luckyDogs.forEach(function(dog){dog.hide()});
        this.unLuckyDogs.forEach(function(dog){dog.show()});

        document.getElementById('chaos').innerHTML = '结束';
        document.getElementById('draw-list').innerHTML = '中奖名单';

        this.toRandom();

        //dirty code, *this* in setInterval refer to windows. It can be avoid only when using ES6
        var _this = this;
        var doChaos = function(){_this.toRandom()};
        this.chaosInterval = self.setInterval(doChaos,2000);
    },

    stopDraw: function(){
        this.logCurState();

        document.getElementById('chaos').innerHTML = '开始';
        window.clearInterval(this.chaosInterval);

        var drawNum = document.getElementById('draw-num').value ? document.getElementById('draw-num').value : 1;
        var drawLevel = document.getElementById('draw-level').value ? parseInt(document.getElementById('draw-level').value) : 3;
        if(3<drawLevel || drawLevel<1){
            drawLevel = 3
        }

        this.makeDogLucky(drawNum, drawLevel);
        // unlucky dogs array to helix as shell
        this.toHelixShape();
        // lucky dogs array to rectangle in the front
        this.toRectangleShape();
    },

    showDrawList: function(){
        if(this.isViewLevel){
            document.getElementById('draw-list').innerHTML = '分级浏览';
            this.toGroupShape()
        }else{
            document.getElementById('draw-list').innerHTML = '分组浏览';
            this.toThreeShape()
        }
        this.isViewLevel = ! this.isViewLevel;
    },

    showUnDrawList: function(){
        this.toSphereShape();
    },

    makeDogLucky: function(num, level){
        this.newLuckyDogs.forEach(function(dog){dog.hide()});
        this.luckyDogs = this.luckyDogs.concat(this.newLuckyDogs);
        this.newLuckyDogs = [];

        if(num > this.unLuckyDogs.length) num = this.unLuckyDogs.length;
        for(var i=0; i<num; i++) {
            var luckNum = parseInt(Math.random() * this.unLuckyDogs.length);
            this.newLuckyDogs.push(this.unLuckyDogs[luckNum]);
            this.unLuckyDogs[luckNum].luckyLevel = level;
            this.unLuckyDogs.splice(luckNum, 1);
        }
    },

    toGroupShape: function(){
        this.unLuckyDogs.forEach(function(dog){dog.hide()});
        this.luckyDogs = this.luckyDogs.concat(this.newLuckyDogs);
        this.newLuckyDogs = [];
        this.luckyDogs.forEach(function(dog){dog.show()});

        var groupMark = [0, 0, 0, 0, 0, 0];
        var groupTarget = [];
        this.luckyDogs.forEach(function(dog){
            var obj = new THREE.Object3D();
            var curIndex = groupMark[dog.groupId]++;
            var curGrid = dog.groupId;
            obj.position.x = (curIndex%20)*WIDTH - 1260;
            obj.position.y = curGrid*600 - parseInt(curIndex/20)*HEIGHT - 1000;
            groupTarget.push(obj)
        });
        transform(this.luckyDogs, groupTarget, 2000, true);
    },

    toThreeShape: function(){
        this.unLuckyDogs.forEach(function(dog){dog.hide()});
        this.luckyDogs = this.luckyDogs.concat(this.newLuckyDogs);
        this.newLuckyDogs = [];
        this.luckyDogs.forEach(function(dog){dog.show()});

        //record how many dog of level
        var levelMark = [0, 0, 0];
        var threeTarget = [];
        this.luckyDogs.forEach(function(dog){
            var obj = new THREE.Object3D();
            var curIndex = levelMark[dog.luckyLevel - 1]++;
            obj.position.x = (curIndex%20)*WIDTH - 1260;
            obj.position.y = - parseInt(curIndex/20)*HEIGHT + 800;
            threeTarget.push(obj)
        });

        //adjust Y value by level
        var level2YAttach = - (levelMark[0] / 10 + 1) * HEIGHT - 300;
        var level3YAttach = - (levelMark[0] / 10 + 1 + levelMark[1] / 10 + 1) * HEIGHT - 600;

        this.luckyDogs.forEach(function(dog, idx){
            var obj = threeTarget[idx];
            if(dog.luckyLevel == 2) obj.position.y += level2YAttach;
            if(dog.luckyLevel == 3) obj.position.y += level3YAttach;
        });

        transform(this.luckyDogs, threeTarget, 2000, true);
    },

    toRectangleShape: function(){
        var rectangleTargets = [];
        this.newLuckyDogs.forEach(function(dog, idx){
            var obj = new THREE.Object3D();
            obj.position.x = -10*WIDTH/2 + WIDTH + (idx%10)*WIDTH;
            obj.position.y = parseInt(idx/11) * HEIGHT;
            obj.position.z = 2500;
            rectangleTargets.push(obj)
        });
        transform(this.newLuckyDogs, rectangleTargets, 2000, true);
    },

    toHelixShape: function(){
        var helixTargets = [];
        var vector = new THREE.Vector3();
        this.unLuckyDogs.forEach(function(dog, idx){
            var phi = idx*0.175 + Math.PI;
            var obj = new THREE.Object3D();

            obj.position.x = 1400 * Math.sin(phi);
            obj.position.y = -(idx * 8 ) + 1000;
            obj.position.z = 1400 * Math.cos(phi);

            vector.x = obj.position.x * 2;
            vector.y = obj.position.y;
            vector.z = obj.position.z * 2;

            obj.lookAt(vector);
            helixTargets.push(obj)
        });
        transform(this.unLuckyDogs, helixTargets, 2000);
    },

    toSphereShape: function(){
        this.luckyDogs.forEach(function(dog){dog.hide()});
        this.newLuckyDogs.forEach(function(dog){dog.hide()});
        this.unLuckyDogs.forEach(function(dog){dog.show()});

        var sphereTargets = [];
        this.unLuckyDogs.forEach(function(dog, idx, arr){
            var phi = Math.acos(-1 + (2*idx)/arr.length);
            var theta = Math.sqrt(arr.length * Math.PI) * phi;
            var obj = new THREE.Object3D();
            var radius = 800;

            obj.position.x = radius *　Math.cos(theta) * Math.sin(phi);
            obj.position.y = radius *　Math.sin(theta) * Math.sin(phi);
            obj.position.z = radius * Math.cos( phi );
            obj.lookAt(new THREE.Vector3(obj.position.x*2,obj.position.y*2,obj.position.z*2));

            sphereTargets.push(obj)
        });
        transform(this.unLuckyDogs, sphereTargets, 2000);
    },

    toRandom: function(){
        var randomTargets = [];
        this.unLuckyDogs.forEach(function(){
            var obj = new THREE.Object3D();
            obj.position.x = Math.random() * 3000 - 1500;
            obj.position.y = Math.random() * 3000 - 1500;
            obj.position.z = Math.random() * 2000 - 1500;
            randomTargets.push(obj)
        });
        transform(this.unLuckyDogs, randomTargets, 2000);
    },

    logCurState: function(){
        var curState = {unLuckyDogs: [], luckyDogs: [], newLuckyDogs: []};
        this.unLuckyDogs.forEach(function(dog){curState.unLuckyDogs.push([dog.name, dog.id, dog.groupId])});
        this.luckyDogs.forEach(function(dog){curState.luckyDogs.push([dog.name, dog.id, dog.groupId])});
        this.newLuckyDogs.forEach(function(dog){curState.newLuckyDogs.push([dog.name, dog.id, dog.groupId])});
        window.localStorage.bonsaiLog = JSON.stringify(curState);
    }
};


var camera, scene, css3DRenderer, webGLRenderer;
var background, clock, mat;
var controls;
var luckyGroup = new LuckyGroup(unLucky, newLucky, lucky);

main();

function main(){
    initEnv();
    initEvent();
}

function initEnv(){
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 25000);
    camera.position.z = 4000;

    scene = new THREE.Scene();
    luckyGroup.unLuckyDogs.forEach(function(dog){
        scene.add(dog.object3D);
    });
    
    // create sky dome ?
    var geometry = new THREE.SphereGeometry(10000, 60, 40);
    geometry.scale(-1, 1, 1);
    var material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('img/skyDome.jpg')
    });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = 2000;
    scene.add(mesh);

    // create universe background
    // mat = new THREE.ShaderMaterial(universeShader({side: THREE.FrontSide}));
    // background = new THREE.Mesh(new THREE.PlaneBufferGeometry(10000, 10000), mat);
    // background.position.z = -2000;
    // scene.add(background);
    // clock = new THREE.Clock();

    css3DRenderer = new THREE.CSS3DRenderer();
    css3DRenderer.setSize(window.innerWidth, window.innerHeight);
    css3DRenderer.domElement.style.position = 'absolute';
    document.getElementById('container').appendChild(css3DRenderer.domElement);

    webGLRenderer = new THREE.WebGLRenderer();
    webGLRenderer.sortObjects = false;
    webGLRenderer.autoClear = false;
    document.getElementById('container').appendChild(webGLRenderer.domElement);

    controls = new THREE.TrackballControls(camera, css3DRenderer.domElement);
    controls.rotateSpeed = 0.5;
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener('change', render);

    animate();
    onWindowResize();
}

function initEvent(){
    window.addEventListener('resize', onWindowResize, false);

    document.getElementById('draw-list').addEventListener('click', function(){
        luckyGroup.showDrawList();
    }, false);

    document.getElementById('chaos').addEventListener('click', function(){
        luckyGroup.inChaos = !luckyGroup.inChaos;
        if(luckyGroup.inChaos){
            luckyGroup.startDraw();
        }else{
            luckyGroup.stopDraw();
        }
    }, false);

    document.getElementById('un-draw-list').addEventListener('click', function(){
        luckyGroup.showUnDrawList();
    }, false);
}


function animate(){
    requestAnimationFrame(animate);
    TWEEN.update();
    controls.update();
}

function render(){
    //mat.uniforms.time += clock.getDelta() / 1000;
    css3DRenderer.render(scene, camera);
    webGLRenderer.render(scene, camera);
}


function transform(unLuckyDogs, targets, duration, isNotClear){
    if(!isNotClear)TWEEN.removeAll();
    unLuckyDogs.forEach(function(obj, idx){
        var target = targets[idx];

        new TWEEN.Tween(obj.object3D.position)
            .to({x: target.position.x, y: target.position.y, z: target.position.z}, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

        new TWEEN.Tween(obj.object3D.rotation)
            .to({x: target.rotation.x, y: target.rotation.y, z: target.rotation.z}, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

    });

    new TWEEN.Tween(this)
        .to({}, duration * 2)
        .onUpdate(render)
        .start();
}

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    css3DRenderer.setSize(window.innerWidth, window.innerHeight);
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    render();
}