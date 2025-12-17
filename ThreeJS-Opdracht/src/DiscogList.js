const URL = "https://api.discogs.com/users/maxlich07/collection/folders/0/releases";

export async function getDiscogList() {
  try {
    let allReleases = [];
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const response = await fetch(`${URL}?page=${page}`, {
        headers: {
          'User-Agent': 'ThreeJSApp/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      allReleases = allReleases.concat(data.releases);
      
      // Check if there are more pages
      hasMorePages = data.pagination.page < data.pagination.pages;
      page++;
    }

    return allReleases;
  } catch (error) {
    console.error('Failed to fetch Discogs data:', error);
    return [];
  }
}