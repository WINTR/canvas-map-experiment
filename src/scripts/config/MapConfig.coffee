###*
 * Map app configuration options
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
###


MapConfig =


   # Width of each individual canvas square
   # @type {Number}

   CANVAS_SIZE: 300

   # Unique identifier for MapBox app
   # @type {String}

   ID: 'damassi.control-room'


   # Map lands on Seattle during initialization
   # @type {Array}

   INIT:
      location: [41.09024, -95.712891]
      zoom: 4



   MAP_OPTIONS:
      minZoom: 4
      maxZoom: 9






module.exports = MapConfig