/**
 * Created by bonsai on 1/14/17.
 */
var camera, scene, renderer;
var controls;
var objs = [];
var targets=  {table:[], helix:[]};

// for creating table
var groupMark = [0, 0, 0, 0, 0, 0];

init();
animate();

function init(){
    // init 3d env
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 3000;

    scene = new THREE.Scene();

    renderer = new THREE.CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    document.getElementById('container').appendChild(renderer.domElement);

    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 0.5;
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener('change', render);

    window.addEventListener('resize', onWindowResize, false);

    // init 3d obj
    data.forEach(function(entity){
        var card = document.createElement('div');
        card.className = 'card';
        card.style.backgroundColor = groupColor[entity[2]] + (Math.random()*0.5+0.25) + ')';

        var name = document.createElement('div');
        name.className = 'name';
        name.textContent = entity[0];
        card.appendChild(name);

        var info = document.createElement('div');
        info.className = 'info';
        info.innerHTML = entity[1] + '<br>' + group[entity[2]];
        card.appendChild(info);

        var curObj = new THREE.CSS3DObject(card);
        curObj.position.x = Math.random() * 3000 - 1500;
        curObj.position.y = Math.random() * 3000 - 1500;
        curObj.position.z = Math.random() * 2000 - 1500;
        scene.add(curObj);

        objs.push(curObj);
    });

    // init table
    data.forEach(function(entity){
        var curObj = new THREE.Object3D();
        var curIndex = groupMark[entity[2]]++;
        var curGrid = entity[2];
        curObj.position.x = (curIndex%20)*140 - 1260;
        curObj.position.y = curGrid*600 - parseInt(curIndex/20)*180;
        targets.table.push(curObj)
    });


    // button listener
    document.getElementById('table').addEventListener('click', function(){
        transform(targets.table, 2000);
    }, false);

    onWindowResize();
}


function animate(){
    requestAnimationFrame(animate);
    TWEEN.update();
    controls.update();
}


function transform(targets, duration){
    TWEEN.removeAll();
    objs.forEach(function(curObj, idx){
        var target = targets[idx];

        new TWEEN.Tween(curObj.position)
            .to({x: target.position.x, y: target.position.y, z: target.position.z}, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

        new TWEEN.Tween(curObj.rotation)
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


function render(){
    renderer.render(scene, camera);
}

