/**
 * Created by Bonsai on 17-1-16.
 */
var WIDTH = 140;
var HEIGHT = 180;


var group, groupColors, groupLength;
var unLucky, newLucky, lucky;
var LEVEL;


var camera, scene, css3DRenderer, webGLRenderer;
var mesh;
var controls;
var luckyGroup;

document.getElementById('file').addEventListener('change', function(event){
    document.getElementById('notice').style.display = 'none';
    var configFile = event.target.files[0];
    var reader = new FileReader();
    reader.onloadend = function(evt) {
        if (evt.target.readyState == FileReader.DONE) { // DONE == 2
            var config = loadConfig(evt.target.result);
            unLucky = config.unlucky;
            newLucky = [];
            lucky = [];
            group = config.group;
            LEVEL = config.level;
            groupColors = config.groupColors;
            luckyGroup = new LuckyGroup(unLucky, newLucky, lucky);

            main()
        }
    };
    reader.readAsText(configFile);
},false);


var LuckyDog = function(name, id, groupId, luckLevel){
    this.name = name;
    this.id = parseInt(id);
    this.groupId = groupId;
    this.object3D = this.createCard(name, id, groupId);
    this.luckyLevel = luckLevel | 0;
};

LuckyDog.prototype = {
    constructor: LuckyDog,
    createCard: function(){
        var card = document.createElement('div');
        card.id = this.id;
        card.className = 'card';
        card.style.backgroundColor = 'rgba(' + groupColors[this.groupId] + 1 + ')';

        var myName = document.createElement('div');
        myName.className = 'name';
        myName.textContent = this.name;
        var cardBgColor = groupColors[this.groupId].split(',').slice(0,3);
        myName.style.color = 'rgba(' + '0,' + (parseInt(cardBgColor[1])/2) + ',' + (parseInt(cardBgColor[1])*2%255) + ',1)';
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
            _this.unLuckyDogs.push(new LuckyDog(o[0], o[1], o[2], o[3]))
        });
        nl.forEach(function(o){
            _this.newLuckyDogs.push(new LuckyDog(o[0], o[1], o[2], o[3]))
        });
        ly.forEach(function(o){
            _this.luckyDogs.push(new LuckyDog(o[0], o[1], o[2], o[3]))
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
        if(LEVEL<drawLevel || drawLevel<1){
            drawLevel = LEVEL
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
            this.toLevelShape()
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

        var groupMark = [];
        for(var i=0; i<=groupLength; i++){
            groupMark[i] = [0]
        }
        var groupTarget = [];
        this.luckyDogs.forEach(function(dog){
            var obj = new THREE.Object3D();
            var curIndex = groupMark[dog.groupId]++;
            obj.position.x = (curIndex%20)*WIDTH - 1260;
            // obj.position.y = dog.groupId*HEIGHT - parseInt(curIndex/20)*HEIGHT - 1000;
            obj.position.y = dog.groupId * (HEIGHT) - 1000;
            groupTarget.push(obj)
        });
        transform(this.luckyDogs, groupTarget, 2000, true);
    },

    toLevelShape: function(){
        this.unLuckyDogs.forEach(function(dog){dog.hide()});
        this.luckyDogs = this.luckyDogs.concat(this.newLuckyDogs);
        this.newLuckyDogs = [];
        this.luckyDogs.forEach(function(dog){dog.show()});

        //record how many dog of level
        var levelMark = [];
        for(var i=0; i<LEVEL; i++){
            levelMark[i] = 0
        }
        var levelTarget = [];
        this.luckyDogs.forEach(function(dog){
            var obj = new THREE.Object3D();
            var curIndex = levelMark[dog.luckyLevel - 1]++;
            obj.position.x = (curIndex%20)*WIDTH - 1260;
            obj.position.y = - parseInt(curIndex/20)*HEIGHT + 800;
            levelTarget.push(obj)
        });

        //adjust Y value by level
        var yAttach = [0];
        for(i=1; i<LEVEL; i++){
            yAttach[i] = -parseInt(levelMark[i-1] / 10)*HEIGHT - 150 + yAttach[i-1];
        }

        this.luckyDogs.forEach(function(dog, idx){
            levelTarget[idx].position.y += yAttach[dog.luckyLevel-1];
        });

        transform(this.luckyDogs, levelTarget, 2000, true);
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
        this.unLuckyDogs.forEach(function(dog){curState.unLuckyDogs.push([dog.name, dog.id, dog.groupId, dog.luckyLevel])});
        this.luckyDogs.forEach(function(dog){curState.luckyDogs.push([dog.name, dog.id, dog.groupId, dog.luckyLevel])});
        this.newLuckyDogs.forEach(function(dog){curState.newLuckyDogs.push([dog.name, dog.id, dog.groupId, dog.luckyLevel])});
        curState.group = group;
        window.localStorage.bonsaiLog = JSON.stringify(curState);
    }
};

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
    luckyGroup.luckyDogs.forEach(function(dog){
        scene.add(dog.object3D);
    });
    luckyGroup.newLuckyDogs.forEach(function(dog){
        scene.add(dog.object3D);
    });

    // create sky dome ?
    var geometry = new THREE.SphereGeometry(10000, 60, 40);
    geometry.scale(-1, 1, 1);
    var material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('img/xihu.jpg')
    });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = 2000;
    scene.add(mesh);

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


function loadConfig(configText){
    var level = parseInt(configText.split(';')[0].trim());
    var sourceData = configText.split(';')[1].trim().split(',');
    //if last letter is ','
    if(sourceData[sourceData.length-1].trim() == ''){
        sourceData = sourceData.slice(0, sourceData.length-1)
    }

    var result = [];
    for(var i=0; i<sourceData.length; i++){
        //split attr by '|'
        var o = sourceData[i].trim().split('|');
        //if file is divided by space
        if(o.length!=3){
            console.log(o + 'format error');
            continue;
        }
        result.push(o)
    }

    var groups = [];
    //filter all group
    result.forEach(function(one){
        if(groups.indexOf(one[2])<0){
            groups.push(one[2]);
        }
    });

    // change group to group id
    result.forEach(function(one){
        one[2] = groups.indexOf(one[2]);
    });

    // generate random group color
    var groupColors = [];
    groups.forEach(function(){
        groupColors.push(parseInt(Math.random()*255)+','+parseInt(Math.random()*255)+','+parseInt(Math.random()*255)+',' );
    });

    return {
        level: level,
        unlucky: result,
        group: groups,
        groupLength: groups.length,
        groupColors: groupColors
    }

}