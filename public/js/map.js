mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12',
    center: coordinates, // starting position [lng, lat]
    zoom: 12 // starting zoom
});

// Create a custom marker
const marker = new mapboxgl.Marker({ color: "#FF385C" })
    .setLngLat(coordinates)
    .addTo(map);