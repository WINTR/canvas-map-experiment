###*
 * Generate a WINTR gradient based upon our styleguide
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.9.14
###


WintrGradient =

   # Default size of the canvas to be drawn upon
   # @type {Number}

   DEFAULT_SIZE: 512


   # Base colors for composing gradients
   # @type {Object}

   COLORS:
      plum:
         light: '#A14F49'
         dark:  '#5b1915'

      green:
         light: '#ADD4BF'
         dark:  '#4E8273'

      grey:
         light: '#9F9F9F'
         dark:  '#777777'

      pink:     '#FD6685'
      yellow:   '#F8E99E'
      aqua:     '#A6FCEB'
      orange:   '#FC9170'



   yellowPink: ->
      return { start: @COLORS.yellow, stop: @COLORS.pink }

   yellowAqua: ->
      return { start: @COLORS.yellow, stop: @COLORS.aqua }

   pinkAqua: ->
      return { start: @COLORS.pink, stop: @COLORS.aqua }

   yellowOrange: ->
      return { start: @COLORS.yellow, stop: @COLORS.orange }

   orangePink: ->
      return { start: @COLORS.orange, stop: @COLORS.pink }

   yellowGreen: ->
      return { start: @COLORS.yellow, stop: @COLORS.green.light }

   orangeAqua: ->
      return { start: @COLORS.orange, stop: @COLORS.aqua }



   # Generates a color gradient by taking an object consisting of
   # `start` and `stop` and belending them together within a ctx
   # @param {Object} colorRange
   # @return {Context}

   generate: (colorRange) ->
      {start, stop} = colorRange

      canvas = document.createElement 'canvas'
      canvas.width  = @DEFAULT_SIZE
      canvas.height = @DEFAULT_SIZE

      context = canvas.getContext '2d'

      context.rect 0, 0, @DEFAULT_SIZE, @DEFAULT_SIZE
      gradient = context.createLinearGradient 0, 0, @DEFAULT_SIZE, @DEFAULT_SIZE
      gradient.addColorStop 0, start
      gradient.addColorStop 1, stop

      context.fillStyle = gradient
      context.fill()

      return canvas


module.exports = WintrGradient