Canvas Map Experiment
=====================

Experiment in combining MapBox with a Three.js canvas visualization layer

https://minimumwage.firebaseapp.com/

Project Setup
-------------
- Install Node [Node.js Installer](http://nodejs.org/)
- Install Grunt command line interface `sudo npm install -g grunt-cli`
- For sourcemap and Compass support, SASS and Compass gems need to be installed with the --pre flag `gem install sass --pre && gem install compass --pre`
- Clone and cd into the repo `git clone https://github.com/WINTR/canvas-map-experiment.git && cd grunt-frontend-scaffold`
- Then install Grunt task dependencies `npm install`

Development Tasks
-----------------

- For development: `grunt dev` then navigate to `http://localhost:3001` (or IP address).
- For deploy: `grunt build`

This concatinates and minifies all CoffeeScripts and SASS and moves the project into 'dist' for production deploy.
