var scenes = [
  level1 = {
    player : {x : 0.5, y : 0.5},
    exit : {x : 0.5, y : 0.99},
    walls : [
      {x : 0.4, y : 0.6, width : 0.2, height : 0},
      {x : 0.4, y : 0.4, width : 0,   height : 0.2},
      {x : 0.6, y : 0.4, width : 0,   height : 0.2},
    ],
    enemies : {
      fingerSpinner : [
        {x : 0.2, y : 0.1, startAngle : 0, secondAngle: 90, vision : 0.25},
        {x : 0.8, y : 0.9, startAngle : -90, secondAngle: 180, vision : 0.25}
      ],
      path : [
        {pathCoords : [new Vector2(0.2, 0.2), new Vector2(0.8, 0.2), new Vector2(0.8, 0.8), new Vector2(0.2, 0.8)], loop : false},
        {pathCoords : [new Vector2(0.7, 0.7), new Vector2(0.2, 0.7)], loop : false},
      ],
    },
  },

  level2 = {
    player : {x : 0.1, y : 0.1},
    exit : {x : 0.9, y : 0.9},
    walls : [
      {x : 0.3, y : 0,   width : 0,   height : 0.5},
      {x : 0.3, y : 0.5, width : 0.3, height : 0},
      {x : 0.8, y : 0.5, width : 0,   height : 0.5},
    ],
    enemies : {
      fingerSpinner : [
        {x : 0.4, y : 0.1, startAngle : 0, secondAngle: 90, vision : 0.25},
        {x : 0.05, y : 0.9, startAngle : 0, secondAngle: -90, vision : 0.25},
      ],
      path : [
        {pathCoords : [new Vector2(0.4, 0.1), new Vector2(0.9, 0.1), new Vector2(0.9, 0.4), new Vector2(0.4, 0.4)], loop : true},
        {pathCoords : [new Vector2(0.1, 0.7), new Vector2(0.7, 0.7), new Vector2(0.7, 0.2)], loop : true},
      ],
    },
    boxes : [
      {x : 0.7, y : 0.2}
    ]
  },

  level3 = {
    player : {x : 0.15, y : 0.1},
    exit : {x : 0.5, y : 0.5},
    walls : [
      {x : 0.45, y : 0.4, width : 0.35, height : 0},
      {x : 0.45, y : 0.4, width : 0,   height : 0.2},
      {x : 0.55, y : 0.4, width : 0,   height : 0.4},

      {x : 0.3, y : 0.8,   width : 0.6,   height : 0},
      {x : 0.65, y : 0.6,  width : 0.4,   height : 0},
      {x : 0.3, y : 0,     width : 0,     height : 0.8},
      {x : 0.1, y : 0.2,   width : 0.1,   height : 0},

      {x : 0.1, y : 0.4,   width : 0.1,   height : 0},
      {x : 0.1, y : 0.8,   width : 0.1,   height : 0},
      {x : 0.1, y : 0.4,   width : 0,   height : 0.4},
      {x : 0.2, y : 0.4,   width : 0,   height : 0.4},

      {x : 0.8, y : 0.2,   width : 0,   height : 0.2},
    ],
    enemies : {
      fingerSpinner : [
        {x : 0.95, y : 0.65, startAngle : 180, secondAngle: 90, vision : 0.1},
        {x : 0.75, y : 0.3, startAngle : 180, secondAngle: 270, vision : 0.2},
        {x : 0.35, y : 0.05, startAngle : 0, secondAngle: 90, vision : 0.2},

        {x : 0.45, y : 0.65, startAngle : 0, secondAngle: 180, vision : 0.15},
      ],
      path : [
        {pathCoords : [new Vector2(0.05, 0.3), new Vector2(0.25, 0.3), new Vector2(0.25, 0.9), new Vector2(0.05, 0.9)], loop : false},
        {pathCoords : [new Vector2(0.25, 0.9), new Vector2(0.05, 0.9), new Vector2(0.05, 0.3), new Vector2(0.25, 0.3)], loop : false},
        {pathCoords : [new Vector2(0.35, 0.9), new Vector2(0.95, 0.9)], loop : false},

        {pathCoords : [new Vector2(0.9, 0.5), new Vector2(0.6, 0.5), new Vector2(0.6, 0.7), new Vector2(0.85, 0.7)], loop : true},

        {pathCoords : [new Vector2(0.95, 0.1), new Vector2(0.95, 0.45)], loop : false},

        {pathCoords : [new Vector2(0.6, 0.3), new Vector2(0.4, 0.3), new Vector2(0.4, 0.7)], loop : true},
      ],
    },
    boxes : [
      {x : 0.25, y : 0.1},
      {x : 0.95, y : 0.5}
    ]
  }
]
  
