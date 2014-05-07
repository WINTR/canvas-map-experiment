###*
 * Map Canvas application bootstrapper
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
###

MapView = require './views/MapView.coffee'


class MapCanvasApp

   # Kick off the application by instantiating
   # neccessary views

   constructor: ->
      new MapView


$ ->
   new MapCanvasApp
