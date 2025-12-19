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

const size = 256;
const container = document.querySelector('#threejs-container')
const canvas = document.createElement('canvas');

//setup for ThreeJS scene
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(90,window.innerWidth / window.innerHeight,0.1,1000);

function proxyDiscogsImage(url) {
  if (typeof url !== 'string') return null;
  return url.replace('https://i.discogs.com', '/discogs-img');
}

const renderer = new THREE.WebGLRenderer({
  antialias:true,
  // canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

scene.background = new THREE.Color(0xF7DCAD);

const ctx = document.getElementById('#bg');

function changeCanvas(){
  ctx.font = '20pt Arial'
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvasLP.width, canvas.height)
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Tutorialspoint!', canvas.width / 2, canvas.height / 2)
}

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

//handles the movement within one function
function HandleMovement(dir){

  
  if(dir === 1) if(lpIndex >= 0) lpIndex++;
  else lpIndex = 0
  if(dir === -1) if(lpIndex <= lps.length -1) lpIndex--;
  else lpIndex = lps.length - 1

  if(lpIndex >= 0 && lpIndex < lps.length - 1)
  {
     const nextLp = lps[0].geometry.parameters.width + 5;

    lps.forEach(element => {
      element.userData.move = true;
      element.userData.direction = dir;
      element.userData.target = element.position.x - dir * nextLp;
    });
  }else{
    lpIndex = 0
  }
}

leftButton.addEventListener('click', () => HandleMovement(-1));
rightButton.addEventListener('click', () => HandleMovement(1));

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

    const direction = element.userData.direction;
    const delta = element.userData.target - element.position.x;

    if(Math.abs(delta) <= .5){
      element.position.x = element.userData.target;
      element.userData.move = false;
      return;
    }

    element.position.x += Math.sign(delta) * .5;
  });
}