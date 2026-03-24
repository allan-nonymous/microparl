# microparl
Compact Parliament Diagram Tool

Microparl is a a hypercompact and extremely lightweight JS function that creates SVG parliament diagrams (also known as arcdot plots). Yes you heard me right, it is literally just a function, no GUI no python no d3js nonsense no nothing.  If you want, you can even just paste this file into your JS program if you're feeling lazy (plz credit tho), it's that simple. Microparl has/is a single function, arcdot().

#### `function arcdot(colors, angle=0.5, aspect_ratio=0.3, margin=.1, minscale=2, width='100%',  angle_start=(0.25-0.5*angle))`
* colors: [#xxxxxx, #xxxxxx, #yyyyyy] JS list of colors for EACH seat from right to left. If you want two seats of the same color, repeat the same color. Microparl is extremely unopinionated. Accepts lists of any size, including zero.
* angle: [0-1] Span of the arch as a percent of a total circle.
* aspect_ratio: [0-1] Internal to external radius ratio.
* margin: [0≤] Buffer between seats, (as a percentage of the seat size).
* minscale: [0<2<] Minimum scaling constant for small parliaments. Would recommend not setting below 2.
* width: 'string' The width of you svg image. Used to fill in the width parameter.
* angle_start: [0-1] Starting position of the arch as a percent of a total circle.
```
