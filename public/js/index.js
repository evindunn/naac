const wikiMediaAttrib = "<a href=\"https://foundation.wikimedia.org/wiki/Maps_Terms_of_Use\">Wikimedia Maps</a> | Map data © <a href=\"https://openstreetmap.org/copyright\">OpenStreetMap</a> contributors";
const hillShadingTilesURL = "https://tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png";
const wikimediaTilesURL = "https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png";
const collectionsGeojsonURL = "api/collections?geojson=true&columns=institutionCode,collectionCode,tier";

/**
 * Loads open street map tiles into the map container
 * @return L.map
 */
function loadMap() {
  const map = L.map("map");
  const wikiTiles = new L.TileLayer(
    wikimediaTilesURL,
    { minZoom: 3, maxZoom: 10, attribution: wikiMediaAttrib }
  );

  const hillTiles = new L.TileLayer(
    hillShadingTilesURL,
    { minZoom: 8, maxZoom: 10 }
  );

  map.addLayer(wikiTiles);
  map.addLayer(hillTiles);

  return map;
}

/**
 * Returns the collection name for the given collection code
 * @param  {string} institutionCode Institution code the collection belongs to
 * @param  {string} collectionCode Collection code to return the name for
 * @return {Promise<string>} Promise to return the collection name
 */
function getCollectionName(institutionCode, collectionCode) {
  return new Promise((resolve, reject) => {
    try {
      fetch("api/collections/" + institutionCode + "/" + collectionCode + "?columns=collectionName")
        .then((response) => {
          return response.json();
        })
        .then((collectionJson) => {
          let name = collectionJson.collectionName;
          if (name == null) {
            name = "Unnamed Collection";
          }
          resolve(name);
        })
        .catch((err) => {
          reject(err);
        });
    } catch(err) {
      reject(err);
    }
  });
}

/**
 * Return the institution name for the given institution code
 * @param  {integer} institutionCode Institution code to return the name for
 * @return {Promise<string>} Promise to return the institution name
 */
function getInstitutionName(institutionCode) {
  return new Promise((resolve, reject) => {
    try {
      fetch("api/institutions/" + institutionCode + "?columns=institutionName")
        .then((response) => {
          return response.json();
        })
        .then((institutionJson) => {
          resolve(institutionJson.institutionName);
        })
        .catch((err) => {
          reject(err);
        });
    } catch(err) {
      reject(err);
    }
  });
}

/**
 * Populates the map collection data
 * @param  {L.map}  map         Leaflet map object
 * @param  {url}    geojsonUrl  Location of the GeoJSON data
 */
function populateData(map, geojsonUrl) {
  fetch(geojsonUrl)
    .then((geojsonData) => {
      return geojsonData.json();
    })
    .then((geojson) => {
      const pointLayer = L.geoJSON(
        geojson,
        {
          pointToLayer: doTooltip
        }
      ).addTo(map);

      pointLayer.eachLayer((layer) => {
        layer.setStyle(getMarkerStyle(map, layer));
      });

      map.on("zoomend", () => {
        pointLayer.eachLayer((layer) => {
          layer.setRadius(getMarkerRadius(map, layer.feature));
        });
      });
    });
}

/**
 * @param  {L.map}    map       Leaflet map
 * @param  {object}   feature   A GeoJSON point
 * @return {integer}            Radius for the feature's marker based on
 *                              tier and zoom level
 */
function getMarkerRadius(map, feature) {
  const currentZoom = map.getZoom();
  let zoomComp = 1 + currentZoom / 10;

  if (feature.properties.tier) {
    if (feature.properties.tier === 1) {
      return 3 * zoomComp;
    } else if (feature.properties.tier === 2) {
      return 4 * zoomComp;
    } else if (feature.properties.tier === 3) {
      return 4.5 * zoomComp;
    } else if (feature.properties.tier === 4) {
      return 5 * zoomComp;
    }
  }

  // Default, if tier isn't available
  return 3 * zoomComp;
}

/**
 * @param  {L.map}            map     Leaflet map
 * @param  {L.circleMarker}   layer   circleMarker layer
 * @return {object}                   Style for the circleMarker based on
 *                                    tier of the underlying GeoJSON feature
 *                                    and zoom level
 */
function getMarkerStyle(map, layer) {
  return {
    fillColor: "darkgreen",
    fillOpacity: 0.6,
    stroke: false,
    radius: getMarkerRadius(map, layer.feature),
    riseOnHover: true,
    riseOffset: 500
  };
}

/**
 * Populate the markers & corresponding tooltips for each geojson collection
 * @param  {Object} feature GeoJSON feature representing the collection
 * @param  {Array<float>} latLng  [lat, lon]
 * @return {L.circleMarker}       Leaflet circle marker for the geojson point
 */
function doTooltip(feature, latLng) {
  const marker = L.circleMarker(latLng, null);
  marker.on("mouseover", () => { marker.selected = true; });
  marker.on("mouseout", () => { marker.selected = false; });
  marker.once(
    "mouseover",
    () => {
      const propertiesPopulated = [];

      if (!("collectionName" in feature.properties)) {
        propertiesPopulated.push(
          getCollectionName(feature.properties.institutionCode, feature.properties.collectionCode)
            .then((name) => {
              return feature.properties.collectionName = name;
            })
          );
      }

      if (!("institutionName" in feature.properties)) {
        propertiesPopulated.push(
          getInstitutionName(feature.properties.institutionCode)
            .then((institutionName) => {
              return feature.properties.institutionName = institutionName;
          })
        );
      }

      Promise.all(propertiesPopulated).then(() => {
        marker.unbindTooltip();
        marker.bindTooltip(
          "<h3>" + feature.properties.institutionName + "</h3>" +
          "<h4>" + feature.properties.collectionName + "</h4>"
        );

        if (marker.selected) {
          marker.openTooltip();
        }
      });
    }
  );
  return marker;
}

/**
 * Page's main function
 */
function main() {
  const map = loadMap();
  map.setView([39.8, -98.6], 4);
  populateData(map, collectionsGeojsonURL);
}

window.onload = main;
