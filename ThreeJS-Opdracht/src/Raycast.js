import * as THREE from 'three'

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let intersects = [];
let currentHover = null;

export function ShootRaycaster(camera,scene, e){

  mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1)

  raycaster.setFromCamera(mouse, camera)
  intersects = raycaster.intersectObjects(scene.children, true)

  if(intersects.length > 0){
    const hit = intersects[0].object;

    if(currentHover !== hit){
      if(currentHover && currentHover.onLeaveHover){
        currentHover.onLeaveHover();
      }
    }

    currentHover = hit;
    if(currentHover.onHover)currentHover.onHover(currentHover);
  }
  else{
    if(currentHover && currentHover.onLeaveHover){
      currentHover.onLeaveHover();
    }
    currentHover = null;
  }
}

export function HandleClick() {
  intersects.forEach(hit => {
    if (hit.object.onClick) hit.object.onClick(hit);
  });
}