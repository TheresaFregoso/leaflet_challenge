// Define tile layers
let streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
let topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.opentopomap.org">OpenTopoMap</a>'
});

// Create the map object with the default layer
let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [streetMap] // Set the initial layer
});

// Define base maps for layer control
let baseMaps = {
    "Street Map": streetMap,
    "Topographic Map": topoMap
};

// Use this link to get the GeoJSON data.
let link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Function to scale marker size based on magnitude
function markerSize(magnitude) {
    return magnitude * 8000; // Adjust the multiplier as needed for scaling
}

// Function to get distinct color based on depth
function getColor(depth) {
    return depth > 90 ? "#8b008b" : // Dark Purple
           depth > 70 ? "#ff8c00" : // Orange
           depth > 50 ? "#ffd700" : // Yellow
           depth > 30 ? "#7fff00" : // Light Green
           depth > 10 ? "#00ced1" : // Cyan
                        "#add8e6";  // Light Blue
}

// Load the GeoJSON data
d3.json(link).then(function(data) {
    // Create a GeoJSON layer with the data
    let earthquakes = L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            // Set marker properties based on magnitude and depth
            let magnitude = feature.properties.mag;
            let depth = feature.geometry.coordinates[2]; // Depth is the third coordinate
            
            return L.circle(latlng, {
                radius: markerSize(magnitude),
                fillColor: getColor(depth),
                color: "black",
                weight: 1,
                fillOpacity: 0.75
            }).bindPopup(`<h1>Location: ${feature.properties.place}</h1>
                          <hr>
                          <h3>Magnitude: ${magnitude}</h3>
                          <h3>Depth: ${depth} km</h3>`);
        }
    });

    // Add the earthquake data to the map
    earthquakes.addTo(myMap);

    // Add the layer control to toggle between base maps and show earthquake data
    L.control.layers(baseMaps, { "Earthquakes": earthquakes }).addTo(myMap);

    // Create a legend
    let legend = L.control({ position: "bottomright" });

    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        let depths = [-10, 10, 30, 50, 70, 90];
        let colors = ["#add8e6", "#00ced1", "#7fff00", "#ffd700", "#ff8c00", "#8b008b"];
              
        div.innerHTML = "<h3>Depth (km)</h3>";

        // Loop through depth intervals to generate labels with colored squares
        for (let i = 0; i < depths.length; i++) {
            div.innerHTML +=
                `<i style="background: ${colors[i]};"></i> ` +
                depths[i] + (depths[i + 1] ? "&ndash;" + depths[i + 1] + "<br>" : "+");
        }
        return div;
    };

    // Add legend to the map
    legend.addTo(myMap);
});
