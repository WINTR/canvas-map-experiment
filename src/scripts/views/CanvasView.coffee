###*
 * Canvas Layer which represents data to be displayed on the MapView
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
###

Event      = require '../events/Event.coffee'
View       = require '../supers/View.coffee'
ThreeScene = require './ThreeScene.coffee'


class CanvasView extends View


   # ID of DOM container for canvas layer
   # @type {String}

   id: 'canvas-layer'



   # Initialize the map layer
   # @param {Object} options

   constructor: (options) ->
      super options



   # Render the view layer and begin THREE.js ticker
   # @public

   render: ->
      @scenes = (_.range 10).map (scene) ->
         scene = new ThreeScene
            position:
               x: ~~(Math.random() * 2000)
               y: ~~(Math.random() * 2000)

      # Append to dom and start ticker
      @scenes.forEach (scene) => @$el.append scene.render().$el
      @onTick()



   # Render the view layer and begin THREE.js ticker
   # @public

   updateZoom: (zoom) ->
      console.log zoom




   # EVENT HANDLERS
   # --------------------------------------------------------------------------------


   # Handler for THREE.js requestAnimationFrame event loop

   onTick: (event) =>
      @scenes.forEach (scene) -> scene.tick()
      requestAnimationFrame @onTick






   # PRIVATE METHODS
   # --------------------------------------------------------------------------------





module.exports = CanvasView