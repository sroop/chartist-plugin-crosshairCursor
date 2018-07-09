# CrosshairCursor plugin for Chartist.js

A Chartist.js plugin to easily add a data crosshair to your charts!

[Live demo](https://sroop.github.io/chartist-plugin-crosshairCursor/example.html).

## Installation

```
bower install chartist-plugin-crosshairCursor
```

## Available options with their defaults

```javascript
var noop = function() {};

var defaultOptions = {
  wrapChart: function(chart) {
    var chartWrapper = document.createElement('div');
    chartWrapper.className = "crosshairCursor-wrapper";
    chart.container.parentNode.insertBefore(chartWrapper, chart.container);
    chartWrapper.appendChild(chart.container);
    chartWrapper.style.cursor = 'pointer';
    chartWrapper.style.position = 'relative';

    return chartWrapper;
  },
  x: true,
  y: true,
  click: noop,
  hover: noop,
  freezeChange: noop,
  styles: {
    x: {
      backgroundColor: '#dedede',
      width: '1px',
      height: '95%'
    },
    y: {
      backgroundColor: '#dedede',
      width: '100%',
      height: '1px'
    }
  }
};
```

### wrapChart
In order for the plugin to work, the chart must be wrapped in a parent element. The default function provided to the `wrapChart` option programmatically generates a parent element and wraps the chart for you, which by default is in a `div` element with the class name `crosshairCursor-wrapper`. If you want to change this behaviour, you can pass in your own chart wrapping function ensuring the parent element is returned.

### x / y
The crosshair cursor type can be customized to an x-axis cursor, y-axis cursor or a full crosshair cursor spanning both axis. By default, both `x` and `y` are set to `true`, creating a full crosshair. To generate an x-axis cursor, set only `x` to `true`. To generate a y-axis curusor, set only `y` to `true`. `x` and `y` cannot both be set to `false`.

### click
The `click` option allows you to pass in a custom click function which provides you with two arguments: the crosshairCursor object, which exposes a bunch of functions you can use within the function, and the current data points you are hovered over (if any) at the moment of click. As an example, you can easily write a function that locks the crosshair cursor in place on click if that is the desired behaviour:
```javascript
click: function(crosshairCursor, chartData) {
  crosshairCursor.isFrozen() ? crosshairCursor.unfreeze() : crosshairCursor.freeze()
}
```
By default, the `click` option is an empty function.

### hover
The `hover` option allows you to pass in a custom function which is executed on `mousemove` and allows you to receive any meta data on the data points you're hovered over. Like the `click` function, it provides you with two arguments: the crosshairCursor object and the data points you are currently hovered over.
```javascript
hover: function(crosshairCursor, chartData) {
  // custom hover function
}
```
By default, the `hover` option is an empty function.

### freezeChange
The `freezeChange` option allows you to pass in a custom function which is ran each time the crosshair cursor is frozen or unfrozen. The new frozen status is passed as the function argument and as demonstrated with the `click` option example above, the crosshair cursor can be frozen and unfrozen really easily, if that behaviour is required.
```javascript
freezeChange: function(status) {
  // custom function
}
```
By default, the `freezeChange` option is an empty function.

### styles
The `styles` option is an object that defines the crosshair cursor's styling. You can set the cursor colour using the `backgroundColor` attribute for each crosshair cursor type, as well as setting the width and height. If you don't define any `styles`, it will default to the following:
```javascript
styles: {
  x: {
    backgroundColor: '#dedede',
    width: '1px',
    height: '95%'
  },
  y: {
    backgroundColor: '#dedede',
    width: '100%',
    height: '1px'
  }
}
```

## Available methods

### create
`create` is executed when the chart is first created on the page. It wraps the chart in a container element and generates the crosshair cursors. You can call this method yourself if you've used the `destroy` method below and need to recreate the crosshairCursor functionality.

### destroy
`destroy` unwraps the chart and deletes the crosshair cursors generated on `create`. It restores your chart, as if the plugin wasn't in use. You can call `create` to re-initialize the plugin setup.

### wrapChart
`wrapChart` is called within the `create` method. If you've passed in your own custom chart wrapping function, it will be called here. if you don't pass in your own custom chart wrapping function, the default function will be used (see `wrapChart` part in the Avilable options section above).

### show
`show` makes the crosshair cursors visible by css, if they are hidden.

### hide
`hide` makes the crosshair cursors invisible by css: `display: none;`, if they are visible.

### reset
`reset` unfreezes the chart (if it's frozen) and hides the crosshair cursors.

### freeze
`freeze` freezes the crosshair cursor in place on the chart and calls the `freezeChange` function (if the user has passed one into the options object).

### unfreeze
`unfreeze` unfreezes the crosshair cursor and calls the `freezeChange` function (if the user has passed one into the options object).

### isFrozen
`isFrozen` returns the current frozen status of the chart.

### currentPoints
`currentPoints` returns a list of chart data points currently hovered over by the crosshair, if there are any.

### element
`element` returns the chart parent container, generated by the `wrapChart` function. You can set your own event listeners to this element, if desired. For example, you could freeze the chart whenever the letter f gets pressed:
```javascript
var freezeCursor = function(){
  chart.crosshairCursor.isFrozen() ? chart.crosshairCursor.unfreeze() : chart.crosshairCursor.freeze()
};
chart.crosshairCursor.element().addEventListener('onkeydown', freezeCursor)

```

## Sample usage for a line chart

```javascript
var chart = new Chartist.Line('.chart', {
  labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  series: [
    {
      name: 'line',
      data: [
        {value: 12, meta: {id: 1, title: "First point"}},
        {value: 9, meta: {id: 2, title: "Second point"}},
        {value: 7, meta: {id: 3, title: "Third point"}},
        {value: 9, meta: {id: 4, title: "Fourth point"}},
        {value:5, meta: {id: 5, title: "Fifth point"}}
      ]
    }
  ]
}, {
     width: '600px',
     height: '300px',
     fullWidth: true,
     chartPadding: { right: 40 },
     plugins: [
       Chartist.plugins.crosshairCursor({
         x: true,
         y: false,
         click: function(crosshairCursor, chartData) {
           crosshairCursor.isFrozen() ? crosshairCursor.unfreeze() : crosshairCursor.freeze()
         },
         hover: function(crosshairCursor, chartData) {
           // custom hover function
         }
       })
     ]});
```
### Setting up the chart and data
The `data` array that gets passed into the `series` option must contain a `meta` object. The meta data contained in this object for each data point gets passed into the `click` and `hover` functions (defined in the options object) as the second argument.

### Javascript events
The following events are available for use if needed:

```javascript
chart.on('crosshairCursor:frozen', function (isFrozen) {
  console.log("Chart is frozen?", isFrozen)
}, false);

chart.on('crosshairCursor:hovered', function(highlightedPoints) {
  console.log("Highlighted points" highlightedPoints)
}, false);

chart.on('crosshairCursor:click', function(highlightedPoints) {
  console.log("Highlighted points" highlightedPoints)
}, false);
```

### Available classes
```css
.crosshairCursor-wrapper {} // the default chart wrapper class name, if a custom `wrapChart` function is not set
.crosshairCursor-x {} // the x-axis cursor (colour, width and height to be set in the "styles" option object)
.crosshairCursor-y {} // the y-axis cursor (colour, width and height to be set in the "styles" option object)
.ct-point.crosshairCursor-highlight {} // data point class name when the crosshair cursor highlights it
```

### Sample CSS 

```css
.crosshairCursor-wrapper {
  height: 300px;
  width: 600px;
}
.crosshairCursor-highlight {
  stroke: #FFDA34 // the colour of any highlighted data points
}
```
