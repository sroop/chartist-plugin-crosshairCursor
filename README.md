# Crosshair cursor plugin for Chartist.js

A Chartist.js plugin to easily add a data crosshair to your charts!

[Live demo](https://sroop.github.io/chartist-plugin-crosshairCursor/example.html).

## Installation

```
bower install chartist-plugin-crosshairCursor
```

## Available options and their defaults

```javascript
var defaultOptions = {
  wrapperName: ".crosshairWrapper", // accepts a class or id //e.g. ".myChart" or "#myChart"
  // Generates an element that wraps the chart and the crosshair cursor elements
  type: "full", // accepts "x", "y" or "full"
  // Generates an x-axis, y-axis or x and y-axis cursor
  clickToFreeze: true, // accepts true or false
  // click the graph to freeze and unfreeze the cursor
  sendDataOn: "hover", // accepts "hover" or "click"
  // emits a javascript event containing meta data about all points that fall along the crosshair axis
  initial: 1 // accepts any number
  // highlights a data point when the chart first loads, whereby the initial value, x, corresponds to the xth data point in your series
};
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
     fullWidth: true,
     chartPadding: { right: 40 },
     plugins: [
       crosshairCursor({
         wrapperName: '.myChart',
         type: 'full', // x, y, full
         clickToFreeze: true, // true, false
         sendDataOn: 'hover', // hover, click
         initial: 1 // highlight the first point
       })
     ]});
```
### Chart data
The data array that gets passed into the `series` option must contain a `meta` object. When any data points fall along the crosshair cursor axis, an event gets sent containing the meta data.


### Javascript events

```javascript
chart.on('crosshairCursor:frozen', function (isFrozen) {
  console.log("Chart is frozen?", isFrozen)
}, false);

chart.on('crosshairCursor:hovered', function(highlightedPoints) {
  console.log("Highlighted points" highlightedPoints)
}, false);
```

### Available classes
```scss
${wrapperName} {} // the wrapperName specified in the plugin options
#crosshairCursor-x {} // the x-axis cursor
#crosshairCursor-y {} // the y-axis cursor
.ct-point.crosshairCursor-highlight {} // point highlighting
```

### Sample CSS 

```scss
.crosshairCursor { // wrapperName
  height: 200px;
  width: 600px;
  #crosshairCursor-x {
    width: 3px; // default is 1px (thickness of the line)
    background-color: $barbiePink // default is #dedede (the colour of the x-crosshair)
  }
  #crosshairCursor-y {
    height: 3px; // default is 1px (thickness of the line)
    background-color: $barbiePink // default is #dedede (the color of the y-crosshair)
  }
  line.crosshairCursor-highlight {
    stroke: #FFDA34 // the colour of any highlighted data points
  }
}
```
