import * as THREE from 'three'

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let intersects = [];

export function ShootRaycaster(camera,scene, e){
  mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1)

  raycaster.setFromCamera(mouse, camera)
  intersects = raycaster.intersectObjects(scene.children, true)
}

export function HandleClick() {
  intersects.forEach(hit => {
    if (hit.object.onClick) hit.object.onClick(hit);
  });
}