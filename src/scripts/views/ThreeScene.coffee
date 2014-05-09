###*
 * Individual Three.js Scenes
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.8.14
###

MapConfig = require '../config/MapConfig.coffee'
Event     = require '../events/Event.coffee'
View      = require '../supers/View.coffee'


class ThreeScene extends View


   # Class name of DOM container for individual Three.js scenes
   # @type {String}

   className: 'scene'



   constructor: (options) ->
      super options

      @setupThreeJSRenderer()




   render: ->
      size = MapConfig.CANVAS_SIZE

      _.defer =>
         @renderer.setSize size, size
         @$el.append @renderer.domElement

      @




   tick: ->
      @cube.rotation.y += .1
      @renderer.render @scene, @camera




   updateCameraAngle: (x, y) ->
      @camera.position.x = x
      @camera.position.y = y




   setupThreeJSRenderer: ->
      cameraAttributes =
         angle: 45
         aspect: MapConfig.CANVAS_SIZE / MapConfig.CANVAS_SIZE
         near: .1
         far: 1000

      # Scene parameters
      @scene    = new THREE.Scene
      @camera   = new THREE.PerspectiveCamera cameraAttributes.angle, cameraAttributes.aspect, cameraAttributes.near, cameraAttributes.far
      @renderer = new THREE.CanvasRenderer alpha: true

      # Object parameters
      @geometry = new THREE.BoxGeometry 2, 30, 2

      for i in [0..@geometry.faces.length - 1] by +2
         hex = Math.random() * 0xffffff
         @geometry.faces[i].color.setHex hex
         @geometry.faces[i + 1].color.setHex hex


      @material = new THREE.MeshBasicMaterial vertexColors: THREE.FaceColors, overdraw: 0.5
      @cube     = new THREE.Mesh @geometry, @material

      # Update view
      @renderer.setClearColor 0x000000, 0
      @camera.position.z = 50

      @scene.add @cube

      @cube.rotation.x = 20
      @cube.rotation.y = 20



module.exports = ThreeScene