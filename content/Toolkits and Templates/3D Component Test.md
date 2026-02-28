
<script type="module" src="/three-runtime.js"></script>
```3D-scene
{
  "models": [
    {"name": "KingHiddenBoss.obj", "scale": 0.5, "position": [0, 0, 0], "rotation": [0, 0, 0]}
  ],
  "lights": [
    {"type": "directional", "color": "FFFFFF", "pos": [5,10,5], "target": [0,0,0], "strength": 1, "castShadows": true, "show": false},
    {"type": "ambient", "color": "FFFFFF", "pos": [0,0,0], "strength": 0.5, "show": false}
  ],
  "camera": {
    "orthographic": false,
    "camPosXYZ": [0,5,10],
    "LookatXYZ": [0,0,0]
  },
  "scene": {
    "showGuiOverlay": false,
    "autoRotation": [0, 0.001, 0],
    "backgroundColor": "transparent",
    "showGroundShadows": true,
    "orbitControlDamping": true,
    "showAxisHelper": false,
    "length": 5,
    "showGridHelper": false,
    "gridSize": 10
  },
  "stl": {
    "stlColorHexString": "606060",
    "stlWireframe": false
  },
  "renderBlock": {
    "widthPercentage": 100,
    "height": 300,
    "alignment": "center"
  }
}
```
