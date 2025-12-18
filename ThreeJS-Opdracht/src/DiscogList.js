import * as THREE from 'three';

const URL = "https://api.discogs.com/users/maxlich07/collection/folders/0/releases";

export async function FetchDiscogList() {
  try {
    const response = await fetch(URL, {
      headers: {
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.releases;
  } catch (error) {
    console.error('Failed to fetch Discogs data:', error);
    return [];
  }
}

export async function LoadDiscTexture(url){
  const response = await fetch(url);
  const blob = await response.blob();
  const objectURL = window.URL.createObjectURL(blob);

  return new Promise((resolve)=>{
    const loader = new THREE.TextureLoader();
    loader.load(objectURL,(texture)=>{
      window.URL.revokeObjectURL(objectURL);
      resolve(texture);
    })
  })
}