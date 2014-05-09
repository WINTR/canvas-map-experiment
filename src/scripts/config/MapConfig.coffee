###*
 * Map app configuration options
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
###


MapConfig =


   # Unique identifier for MapBox app
   # @type {String}

   ID: 'damassi.i68ol38a'


   # Map lands on Seattle during initialization
   # @type {Array}

   INIT:
      location: [40.09024, -95.712891]
      zoom: 5


   # Width of each individual canvas square
   # @type {Number}

   CANVAS_SIZE: 300



module.exports = MapConfig