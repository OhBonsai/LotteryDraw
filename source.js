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
        card.id = this.id;
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
        document.getElementById(this.id).style.display = '';
        this.object3D.visible = true;
    },
    hide: function(){
        document.getElementById(this.id).style.display = 'none';
        this.object3D.visible = false;
        console.log(1);
    }
};

var LuckyGroup = function(d){
    this.inChaos = false;
    this.chaosInterval = null;

    this.isViewLevel = false;

    this.newLuckyDogs = [];
    this.luckyDogs = [];
    this.unLuckyDogs = [];
    this.initDogs(d);
};

LuckyGroup.prototype = {
    constructor: LuckyGroup,

    initDogs: function(d){
        var _this = this;
        d.forEach(function(o){
            _this.unLuckyDogs.push(new LuckyDog(o[0], o[1], o[2]))
        })
    },

    startDraw: function(){
        this.luckyDogs.forEach(function(dog){dog.hide()});
        this.unLuckyDogs.forEach(function(dog){dog.show()});
        document.getElementById('chaos').innerHTML = '结束';
        document.getElementById('draw-list').innerHTML = '中奖名单';
        this.toRandom();
        var _this = this;
        //dirty code, *this* in setInterval refer to windows. It can be avoid only when using ES6
        var doChaos = function(){_this.toRandom()};
        this.chaosInterval = self.setInterval(doChaos,2000);
    },

    stopDraw: function(){
        document.getElementById('chaos').innerHTML = '开始';
        window.clearInterval(this.chaosInterval);
        var drawNum = document.getElementById('draw-num').value ? document.getElementById('draw-num').value : 1;
        var drawLevel = document.getElementById('draw-level').value ? document.getElementById('draw-level').value : 3;
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
            this.toGroupShape()
        }
        this.isViewLevel = ! this.isViewLevel;

    },

    makeDogLucky: function(num, level){
        this.newLuckyDogs.forEach(function(dog){dog.hide()});
        this.luckyDogs = this.luckyDogs.concat(this.newLuckyDogs);
        this.newLuckyDogs = [];

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
            var curIndex = levelMark[dog.luckyLevel]++;
            obj.position.x = (curIndex%20)*WIDTH - 1260;
            obj.position.y = parseInt(curIndex/20)*HEIGHT - 1000;
            threeTarget.push(obj)
        });

        //adjust Y value by level
        var level2YAttach = (levelMark[0] / 10 + 1) * HEIGHT + 180;
        var level3YAttach = (levelMark[0] / 10 + 1 + levelMark[1] / 10 + 1) * HEIGHT + 180;

        this.luckyDogs.forEach(function(dog, idx){
            var obj = threeTarget[idx];
            if(dog.luckyLevel == 2) obj.position.y += level2YAttach;
            if(dog.luckyLevel == 3) obj.position.y += level3YAttach;
        });

        transform(this.luckyDogs, threeTarget, 2000, true);
    },

    toRectangleShape: function(){
        var rectangleTargets = [];
        this.newLuckyDogs.forEach(function(dog, idx, arr){
            var obj = new THREE.Object3D();
            obj.position.x = -arr.length*WIDTH/2 + WIDTH + (idx%10)*WIDTH;
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
    }
};


var camera, scene, renderer;
var controls;
var luckyGroup = new LuckyGroup(data);

main();

function main(){
    initEnv();
    initEvent();
}

function initEnv(){
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 4000;

    scene = new THREE.Scene();
    luckyGroup.unLuckyDogs.forEach(function(dog){
        scene.add(dog.object3D);
    });

    renderer = new THREE.CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    document.getElementById('container').appendChild(renderer.domElement);

    controls = new THREE.TrackballControls(camera, renderer.domElement);
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
}


function animate(){
    requestAnimationFrame(animate);
    TWEEN.update();
    controls.update();
}

function render(){
    renderer.render(scene, camera);
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
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}




