import { array } from "three/tsl";

const URL = "https://api.discogs.com/users/maxlich07/collection/folders/0/releases";

export async function FetchDiscogList() {
  try {
    const response = await fetch(URL, {
      headers: {
        Authorization: "Discogs token=slXelsFzPmkDSOXLZoxAjegaABgyxeLIzcgQCtlH"
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