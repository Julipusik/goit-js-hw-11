import axios from "axios";

const BAZE_URL = 'https://pixabay.com/api/';

async function fetchImages(searchValue, page = 1) {
    const params = new URLSearchParams({
        key: "38459323-6d1f9d3342befc1e8bde8652c",
        q: searchValue,
        image_type: "photo",
        orientation: "horizontal",
        safesearch: "true",
        per_page: 40,
        page: `${page}`,
    });

    const { data } = await axios.get(`${BAZE_URL}?${params}`);
    return data;
}

export { fetchImages };