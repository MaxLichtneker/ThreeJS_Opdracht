import * as THREE from 'three';

import { FetchDiscogList } from './DiscogList.js';
import {LoadDiscTexture} from './DiscogList.js';
import {ShootRaycaster} from './Raycast.js';
import {HandleClick} from './Raycast.js';
import { element } from 'three/tsl';

//fetch data from discogs api
const fetchedLps = await FetchDiscogList();

//array that holds all the lp meshes
const lps = new Array();
let lpIndex = 0;  

const rightButton = document.getElementById('right-button');
const leftButton = document.getElementById('left-button');

const container = document.querySelector('#threejs-container')

//setup for ThreeJS scene
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(90,window.innerWidth / window.innerHeight,0.1,1000);

function proxyDiscogsImage(url) {
  if (typeof url !== 'string') return null;
  return url.replace('https://i.discogs.com', '/discogs-img');
}

const renderer = new THREE.WebGLRenderer({
  antialias:true,
});

container.append(renderer.domElement);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

scene.background = new THREE.Color(0xF7DCAD);

//adds meshes based on the fetched data from discogs and adds images on front face
async function AddLps(){
  let position =  0;
  let zPos = 20;

  const geometry = new THREE.BoxGeometry(10, 10, .1);
  for (let i = 1; i < fetchedLps.length; i++) {
    const lpData = fetchedLps[i];

    const coverImageUrl = proxyDiscogsImage(lpData.basic_information.cover_image);
    const texture = await LoadDiscTexture(coverImageUrl);

    const backTexture = LpBackTexture({title:fetchedLps[i].basic_information.title,artist:fetchedLps[i].basic_information.artists[0].name, year:fetchedLps[i].basic_information.year});

    const materials = [
      new THREE.MeshBasicMaterial({color: 0xb5110b}), // right
      new THREE.MeshBasicMaterial({color: 0xb5110b}), // left
      new THREE.MeshBasicMaterial({color: 0xb5110b}), // top
      new THREE.MeshBasicMaterial({color: 0xb5110b}), // bottom 
      new THREE.MeshBasicMaterial({map: texture}), // front (placeholder)
      new THREE.MeshBasicMaterial({map: backTexture}), // back
    ];
    const cube = new THREE.Mesh(geometry, materials);

    //set initial positions of lps
    cube.position.set(position, 0, zPos);
    position += cube.geometry.parameters.width + 5;

    //onClick event action
    cube.onClick = () =>{
      if(cube.rotation.y < Math.PI){
           cube.userData.rotate = true;
      }else{
          cube.userData.rotate = false;
      }
    }

    //onHover event
    cube.onHover = () =>{
      cube.userData.hover = true;
    }

    //onLeaveHover event
    cube.onLeaveHover = ()=>{
      console.log("left hover")
      cube.userData.hover = false;
    }

    scene.add(cube);
    lps.push(cube);
  }
}

//handles the movement within one function
function HandleMovement(dir){
  const maxIndex = lps.length - 1;

  const nextIndex = THREE.MathUtils.clamp(lpIndex + dir, 0, maxIndex);
  if(nextIndex === lpIndex) return;
  lpIndex = nextIndex;
  console.log(lpIndex);

  if(lpIndex >= 0 && lpIndex < lps.length - 1)
  {
     const nextLp = lps[0].geometry.parameters.width + 5;

    lps.forEach(element => {
      element.userData.move = true;
      element.userData.direction = dir;
      element.userData.target = element.position.x - dir * nextLp;
    });
  }
}

//button events
leftButton.addEventListener('click', () => HandleMovement(-1));
rightButton.addEventListener('click', () => HandleMovement(1));

//raycast events
window.addEventListener('pointermove', e => ShootRaycaster(camera, scene, e));
window.addEventListener('click', () => {HandleClick();});
window.addEventListener('onHover',() => {HoverAnimation();})

//dynamically resize the canvas
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.render(scene, camera)
})

AddLps();

//Update function
function animate(){
  requestAnimationFrame(animate);

  SmoothRotate();
  HoverAnimation();
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

    RotateWhileMoving(element);

    if(Math.abs(delta) <= .5){
      element.position.x = element.userData.target;
      element.userData.move = false;
      return;
    }

    element.position.x += Math.sign(delta) * .5;
  });
}

function RotateWhileMoving(object){
  const destination = .1;
  const target = object.userData.move ? destination : 0;

  if(!object.userData.rotate){
     object.rotation.y= THREE.MathUtils.lerp(object.rotation.y, target, 0.08);
  }else{
    SmoothRotate();
  }
}

//handles the animation when hovering and not hovering
function HoverAnimation(){
  const hoverY = 1;
  const speed = 0.08

  lps.forEach(element =>{

    const target = element.userData.hover ? hoverY : 0;

    if(element.userData.hover){
      if(element.position.y < target){
        element.position.y = THREE.MathUtils.lerp(element.position.y,target,speed);
      }
    }else{
      element.position.y = THREE.MathUtils.lerp(element.position.y,target,speed);
    }
  });
}

//adds a canvases to each lp
function LpBackTexture({title,artist,year,size = 512,}){
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;

  const context = canvas.getContext('2d');

  context.fillStyle = 'white'
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.fillStyle = 'black'
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  context.font = '30pt Arial'
  context.fillText(title, canvas.width / 2, canvas.height / 2 - 225)

  context.font = '20pt Arial'
  context.fillText(artist, size / 2, size / 2 - 190)

  context.fillText(year, size / 2, size / 2 - 160)

  const backTexture = new THREE.Texture(canvas);
  backTexture.colorSpace = THREE.SRGBColorSpace;

  backTexture.needsUpdate = true;

  return backTexture;
}
 