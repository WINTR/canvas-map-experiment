###*
 * MapBox map layer
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
###

MapConfig = require '../config/MapConfig.coffee'


class MapView


   # MapBox map layer
   # @type {L.Map}

   mapLayer: null


   constructor: (options) ->
      @mapLayer = L.mapbox.map 'map', 'examples.map-9ijuk24y'
      @mapLayer.setView MapConfig.INIT.location, MapConfig.INIT.zoom


module.exports = MapView