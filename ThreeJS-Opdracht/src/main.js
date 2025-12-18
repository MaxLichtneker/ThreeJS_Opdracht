import * as THREE from 'three';
import { FetchDiscogList } from './DiscogList.js';
import { Loader } from 'three/webgpu';
import {LoadDiscTexture} from './DiscogList.js';

const fetchedLps = await FetchDiscogList();

const rightButton = document.getElementById('right-button');
const leftButton = document.getElementById('left-button');

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(90,window.innerWidth / window.innerHeight,0.1,1000);

const lps = new Array();
let lpIndex = 0;  

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

  lps.forEach(element => {
    element.position.x += lps[0].geometry.parameters.width + 5;  
  });
}

//moves the lps to the right
function MoveRight(){
  lpIndex++;  

  if(lpIndex > lps.length - 1){
    lpIndex = lps.length - 1;
    return;
  }

  lps.forEach(element => {
  element.position.x -= lps[0].geometry.parameters.width + 5;  
  });

}

leftButton.addEventListener('click', MoveLeft);
rightButton.addEventListener('click', MoveRight);

AddLps();

function animate(){
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}


animate();