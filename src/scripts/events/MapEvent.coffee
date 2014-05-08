###*
 * Leaflet-related Map events
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
###


MapEvent =

   # Triggered once the MapBox map is initialized and rendered to the DOM
   # @type {String}

   INITIALIZED:      'initialized'
   UPDATE:           'update'
   ZOOM_START:       'zoomstart'
   ZOOM_CHANGED:     'zoomend'


module.exports = MapEvent