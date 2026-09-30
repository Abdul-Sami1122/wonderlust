// Interactive Map Logic supporting Dark & Light themes seamlessly (Zero API Key Required)
(function () {
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  // Default coordinates (Lahore/Fallback)
  let parsedCoords = [31.5204, 74.3587]; // [lat, lng] for Leaflet
  try {
    if (typeof coordinates !== "undefined" && coordinates && coordinates !== "null" && coordinates !== "undefined") {
      const parsed = typeof coordinates === "string" ? JSON.parse(coordinates) : coordinates;
      if (Array.isArray(parsed) && parsed.length === 2 && !isNaN(parsed[0]) && !isNaN(parsed[1])) {
        // GeoJSON uses [lng, lat], Leaflet uses [lat, lng]
        parsedCoords = [Number(parsed[1]), Number(parsed[0])];
      }
    }
  } catch (e) {
    console.warn("Could not parse coordinates, using default location", e);
  }

  // If Leaflet is loaded
  if (typeof L !== "undefined") {
    const map = L.map("map", {
      center: parsedCoords,
      zoom: 12,
      scrollWheelZoom: false,
    });

    // 100% Free OpenStreetMap Tiles - Zero API Key Required
    const osmTileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

    L.tileLayer(osmTileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom Glowing Red Marker Pin (Marker pane is not affected by tile dark filter)
    const customPin = L.divIcon({
      className: "custom-map-pin",
      html: `
        <div style="
          width: 38px;
          height: 38px;
          background: #f2242d;
          border: 3px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 15px rgba(242, 36, 45, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <i class="fa-solid fa-house" style="
            transform: rotate(45deg);
            color: #ffffff;
            font-size: 14px;
          "></i>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -36],
    });

    const popupContent = `
      <div style="font-family: inherit; padding: 4px; min-width: 170px;">
        <h6 style="margin: 0 0 4px 0; font-weight: 700; font-size: 15px;">${typeof Title !== "undefined" && Title ? Title : "Listing Location"}</h6>
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a;">${typeof Location !== "undefined" && Location ? Location : ""}</p>
        <div style="display: inline-block; font-size: 11px; background: rgba(242, 36, 45, 0.1); color: #f2242d; padding: 2px 8px; border-radius: 999px; font-weight: 600;">
          Exact location after booking
        </div>
      </div>
    `;

    L.marker(parsedCoords, { icon: customPin })
      .bindPopup(popupContent)
      .addTo(map);

    // Handle map resizing
    setTimeout(() => {
      map.invalidateSize();
    }, 400);

    return;
  }
})();
