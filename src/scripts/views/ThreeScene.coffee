###*
 * Individual Three.js Scenes
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.8.14
###

WintrGradient = require '../utils/WintrGradient.coffee'
MapConfig     = require '../config/MapConfig.coffee'
Event         = require '../events/Event.coffee'
View          = require '../supers/View.coffee'


class ThreeScene extends View


   # Class name of DOM container for individual Three.js scenes
   # @type {String}

   className: 'scene'



   constructor: (options) ->
      super options

      @setupThreeJSRenderer()




   render: ->
      size = MapConfig.CANVAS_SIZE

      # Add Scene canvas to the dom
      _.defer =>

         @renderer.setSize size, size
         @$el.append @renderer.domElement

         # Animate in the cube
         _.delay =>

            time  = 1
            ease  = Expo.easeInOut
            delay = Math.random() * 5

            return

            TweenMax.fromTo @cube.scale, time, y: .1,
               y: 1
               delay: delay
               ease: ease

            TweenMax.fromTo @cube.rotation, time, x: 19.4,
               x: 20
               delay: delay
               ease: ease

      @




   tick: ->
      @cube.rotation.y += .1 if @cube
      @renderer.render @scene, @camera




   updateCameraAngle: (x, y) ->
      @camera.position.x = x
      @camera.position.y = y




   setupThreeJSRenderer: ->
      height = if @wage.wage isnt 0 then @wage.wage * 3 else 2

      cameraAttributes =
         angle: 45
         aspect: MapConfig.CANVAS_SIZE / MapConfig.CANVAS_SIZE
         near: .1
         far: 100

      # Scene parameters
      @scene    = new THREE.Scene
      @camera   = new THREE.PerspectiveCamera cameraAttributes.angle, cameraAttributes.aspect, cameraAttributes.near, cameraAttributes.far
      @renderer = new THREE.CanvasRenderer alpha: true


      @geometry = new THREE.BoxGeometry 2, height, 2, 2, 2, 2

      # material
      texture  = new THREE.Texture WintrGradient.generate WintrGradient.yellowGreen()
      texture.needsUpdate = true

      material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } )
      @cube = new THREE.Mesh( @geometry, material )
      @cube.rotation.x = 20
      @cube.rotation.y = 20

      @scene.add @cube

      # Update view
      @renderer.setClearColor 0x000000, 0
      @camera.position.z = 50



   generateTexture: (startHex, stopHex) ->
      size = 512
      canvas = document.createElement 'canvas'
      canvas.width = size
      canvas.height = size

      context = canvas.getContext '2d'

      context.rect 0, 0, size, size
      gradient = context.createLinearGradient 0, 0, size, size
      gradient.addColorStop(0, startHex) # light blue
      gradient.addColorStop(1, stopHex) # dark blue
      context.fillStyle = gradient
      context.fill()

      canvas



   randomColor: ->
      letters = '0123456789ABCDEF'.split('');
      color = '#';
      for i in [0..5]
         color += letters[Math.floor(Math.random() * 16)]

      color




   returnRandomColorCube: ->
      # # Object parameters
      # @geometry = new THREE.BoxGeometry 2, height, 2

      # for i in [0..@geometry.faces.length - 1] by +2
      #    hex = Math.random() * 0xffffff
      #    @geometry.faces[i].color.setHex hex
      #    @geometry.faces[i + 1].color.setHex hex


      # @material = new THREE.MeshBasicMaterial vertexColors: THREE.FaceColors, overdraw: 0.5
      # @cube     = new THREE.Mesh @geometry, @material
      # @cube.rotation.x = 20
      # @cube.rotation.y = 20
      # @scene.add @cube






module.exports = ThreeScene