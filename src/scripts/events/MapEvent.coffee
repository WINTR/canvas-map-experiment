###*
 * Leaflet-related Map events
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
###


MapEvent =

   DRAG_START:       'dragstart'
   DRAG:             'drag'
   DRAG_END:         'dragend'

   # Triggered once the MapBox map is initialized and rendered to the DOM
   # @type {String}

   INITIALIZED:      'initialized'
   UPDATE:           'update'
   ZOOM_START:       'zoomstart'
   ZOOM_CHANGED:     'zoomend'


module.exports = MapEvent