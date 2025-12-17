import * as THREE from 'three';
import { getDiscogList } from './DiscogList.js';

import coverImage from './CoverImage.jpg';

// var data = new Array(getDiscogList());

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(90,window.innerWidth / window.innerHeight,0.1,1000);

const loader = new THREE.TextureLoader().load(coverImage);

const lps = new Array();
let lpIndex = 0;  

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

scene.background = new THREE.Color(0xF7DCAD);

function AddLps(){
  let position =  0;
  let zPos = 20;

  const geomtry = new THREE.BoxGeometry(10,10,.1);


  const materials = [
    new THREE.MeshBasicMaterial({color: 0xb5110b}), // right
    new THREE.MeshBasicMaterial({color: 0xb5110b}), // left
    new THREE.MeshBasicMaterial({color: 0xb5110b}), // top
    new THREE.MeshBasicMaterial({color: 0xb5110b}), // bottom 
    new THREE.MeshBasicMaterial({map:loader}), // front
    new THREE.MeshBasicMaterial({color: 0xb5110b}), // back
  ];

  for (let i = 0; i < 5; i++) {
    const cube = new THREE.Mesh(geomtry, materials);

    cube.position.set(position, 0 ,zPos);

    position += cube.geometry.parameters.width + 5;
    // zPos -= 10;

    scene.add(cube);
    lps.push(cube);
  }

}

function MoveLps(){
  lps.forEach(element => {
    element.position.x -= lps[0].geometry.parameters.width + 5;  
  });
  // for (let i = lpIndex; i < lps.length; i++) {
  //   lps[i].position.x += currentLpPosition.x;
  //   lps[i].position.z -= currentLpPosition.z;
  // }
}

document.body.onmouseup = MoveLps;

AddLps();

function animate(){
  requestAnimationFrame(animate);

  lps.forEach(lp =>{
  })

  renderer.render(scene, camera);
}


animate();