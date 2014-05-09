###*
 * View superclass for shared functionality
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
###

class View extends Backbone.View


   # View constructor which accepts parameters and merges them
   # into the view prototype for easy access.
   # @param {Object} options

   initialize: (options) ->

      # Merge passed props or instance defaults
      _.extend @, _.defaults( options = options || @defaults, @defaults || {} )


module.exports = View