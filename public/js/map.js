
maptilersdk.config.apiKey = mapToken;
   const map = new maptilersdk.Map({
  container: 'map', // container's id or the HTML element in which the SDK will render the map
  style: maptilersdk.MapStyle.STREETS,
  center: JSON.parse(coordinates),  // starting position [lng, lat]
  zoom: 10 // starting zoom
});

  const marker = new maptilersdk.Marker(
     {
      color: "red",
     }
  )
  .setPopup(
   new maptilersdk.Popup({offset: 25})
  .setHTML(`<h4>${Title}</h4>
   <p>Exact location will be  provided after booking</p>`)
  )
  .setLngLat(JSON.parse(coordinates))
  .addTo(map);
