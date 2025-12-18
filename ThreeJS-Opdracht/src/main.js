import * as THREE from 'three';

import { FetchDiscogList } from './DiscogList.js';
import {LoadDiscTexture} from './DiscogList.js';
import {ShootRaycaster} from './Raycast.js'
import {HandleClick} from './Raycast.js'

//fetch data from discogs api
const fetchedLps = await FetchDiscogList();

//array that holds all the lp meshes
const lps = new Array();
let lpIndex = 0;  

const rightButton = document.getElementById('right-button');
const leftButton = document.getElementById('left-button');

//setup for ThreeJS scene
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(90,window.innerWidth / window.innerHeight,0.1,1000);

function proxyDiscogsImage(url) {
  if (typeof url !== 'string') return null;
  return url.replace('https://i.discogs.com', '/discogs-img');
}

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

scene.background = new THREE.Color(0xF7DCAD);

//adds meshes based on the fetched data from discogs and adds images on front face
async function AddLps(){
  let position =  0;
  let zPos = 20;

  const geometry = new THREE.BoxGeometry(10, 10, .1);

  for (let i = 0; i < fetchedLps.length; i++) {
    const lpData = fetchedLps[i];

    const coverImageUrl = proxyDiscogsImage(lpData.basic_information.cover_image);
    const texture = await LoadDiscTexture(coverImageUrl);

    const materials = [
      new THREE.MeshBasicMaterial({color: 0xb5110b}), // right
      new THREE.MeshBasicMaterial({color: 0xb5110b}), // left
      new THREE.MeshBasicMaterial({color: 0xb5110b}), // top
      new THREE.MeshBasicMaterial({color: 0xb5110b}), // bottom 
      new THREE.MeshBasicMaterial({map: texture}), // front (placeholder)
      new THREE.MeshBasicMaterial({color: 0xb5110b}), // back
    ];

    const cube = new THREE.Mesh(geometry, materials);
    cube.position.set(position, 0, zPos);
    position += cube.geometry.parameters.width + 5;

    cube.onClick = () =>{
      if(cube.rotation.y < Math.PI){
           cube.userData.rotate = true;
      }else{
          cube.userData.rotate = false;
      }
    }


    scene.add(cube);
    lps.push(cube);
  }
}

//moves the lps to the left
function MoveLeft(){
  lpIndex--;

  if(lpIndex < 0){
    lpIndex = 0;
    return;
  }

  const nextLp = lps[0].geometry.parameters.width + 5;

  lps.forEach(element => {
    element.userData.move = true;
    element.userData.target = element.position.x + nextLp;
  });
}

//moves the lps to the right
function MoveRight(){
  lpIndex++;  

  if(lpIndex > lps.length - 1){
  lpIndex = lps.length - 1;
  return;
  }

  const nextLp = lps[0].geometry.parameters.width + 5;

  lps.forEach(element => {
  element.userData.move = true;
  element.userData.target = element.position.x - nextLp;
  });
}

leftButton.addEventListener('click', MoveLeft);
rightButton.addEventListener('click', MoveRight);

window.addEventListener('pointermove', e => ShootRaycaster(camera, scene, e));
window.addEventListener('click', () => {HandleClick();});

AddLps();

function animate(){
  requestAnimationFrame(animate);

  SmoothRotate();
  SmoothMovement();

  renderer.render(scene, camera);
}


animate();

//rotates the lps smoothly 
function SmoothRotate(){
  lps.forEach(lp => {
    if(lp.userData.rotate){
      if(lp.rotation.y < Math.PI){
        lp.rotation.y += 0.1;
      }
    }

    if(!lp.userData.rotate && lp.rotation.y > 0){
       lp.rotation.y -= 0.1;
    }
  });
}

//moves the lps smoothly to one side or the other
function SmoothMovement(){
  lps.forEach(element => {
    if(!element.userData.move)return
    
    if(element.position.x > element.userData.target)
    {
      element.position.x -= 0.1;  
    }else{
      element.position.x = element.userData.target;
      lp.userData.move = false;
    }
  });
}