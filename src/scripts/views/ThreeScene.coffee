###*
 * Individual Three.js Scenes
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.8.14
###

Event = require '../events/Event.coffee'
View  = require '../supers/View.coffee'


class ThreeScene extends View


   # Class name of DOM container for individual Three.js scenes
   # @type {String}

   className: 'scene'


   size:
      width:  300
      height: 300



   # Initialize the map layer
   # @param {Object} options

   constructor: (options) ->
      super options

      @setupThreeJSRenderer()



   # Render the view layer and begin THREE.js ticker
   # @public

   render: ->
      TweenMax.set @$el, x: @position.x, y: @position.y

      _.defer =>
         @renderer.setSize @size.width, @size.height
         @$el.append @renderer.domElement

      @



   tick: ->
      @cube.rotation.x += .01
      @cube.rotation.y += .01

      @renderer.render @scene, @camera



   # Render the view layer and begin THREE.js ticker
   # @public

   updateZoom: (zoom) ->
      console.log zoom
      #@cube.scale.set zoom, zoom, zoom




   # Setup the THREE.js scene

   setupThreeJSRenderer: ->

      cameraAttributes =
         angle: 45
         aspect: @size.width / @size.height
         near: .1
         far: 1000

      @scene    = new THREE.Scene
      @camera   = new THREE.PerspectiveCamera cameraAttributes.angle, cameraAttributes.aspect, cameraAttributes.near, cameraAttributes.far
      @renderer = new THREE.WebGLRenderer alpha: true
      @geometry = new THREE.BoxGeometry 10, 10, 10
      @material = new THREE.MeshBasicMaterial color: 0xFF0000, wireframe: true
      @cube     = new THREE.Mesh @geometry, @material

      @renderer.setClearColor 0x000000, 0
      @camera.position.z = 50

      @scene.add @cube



module.exports = ThreeScene