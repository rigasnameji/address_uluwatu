var APP_DATA = {
  "scenes": [
    {
      "id": "0-entrance-",
      "name": "Entrance ",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3880,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": -0.6324272766440693,
          "pitch": 0.09124011919526964,
          "rotation": 1.5707963267948966,
          "target": "4-deck"
        },
        {
          "yaw": -0.7459952403165548,
          "pitch": -0.1901923640424812,
          "rotation": 0,
          "target": "2-room"
        },
        {
          "yaw": -1.1388063400934243,
          "pitch": 0.07580931094256727,
          "rotation": 4.71238898038469,
          "target": "3-center"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "1-room-bathroom",
      "name": "Room Bathroom",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3880,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": -2.417773663212767,
          "pitch": 0.2821846279613158,
          "rotation": 4.71238898038469,
          "target": "2-room"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "2-room",
      "name": "Room",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3880,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": 1.5695280652626478,
          "pitch": 0.17857723264393321,
          "rotation": 1.5707963267948966,
          "target": "1-room-bathroom"
        },
        {
          "yaw": 1.248576525585218,
          "pitch": 0.15493239846342455,
          "rotation": 10.995574287564278,
          "target": "6-2nd-floor"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "3-center",
      "name": "Center",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3880,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": -0.7692136627884683,
          "pitch": 0.0460619063494665,
          "rotation": 4.71238898038469,
          "target": "0-entrance-"
        },
        {
          "yaw": -2.443097125767796,
          "pitch": 0.2026749544355333,
          "rotation": 7.853981633974483,
          "target": "4-deck"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "4-deck",
      "name": "Deck",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3880,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": 0.6782404495646901,
          "pitch": 0.29823662907536885,
          "rotation": 0,
          "target": "3-center"
        },
        {
          "yaw": 2.246022760168712,
          "pitch": -0.6821964961145799,
          "rotation": 12.566370614359176,
          "target": "2-room"
        },
        {
          "yaw": -0.5208628821057317,
          "pitch": 0.07285369814103859,
          "rotation": 4.71238898038469,
          "target": "0-entrance-"
        },
        {
          "yaw": 2.6997872530597498,
          "pitch": 0.0970252698185341,
          "rotation": 1.5707963267948966,
          "target": "5-hallway"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "5-hallway",
      "name": "Hallway",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3880,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": 0.0031158277595366712,
          "pitch": 0.15993816073888567,
          "rotation": 0,
          "target": "3-center"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "6-2nd-floor",
      "name": "2nd Floor",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3880,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": 0.29567774128652324,
          "pitch": 0.2824255163398526,
          "rotation": 0,
          "target": "2-room"
        },
        {
          "yaw": 1.6033789629842872,
          "pitch": 0.5904660842612515,
          "rotation": 4.71238898038469,
          "target": "3-center"
        }
      ],
      "infoHotspots": []
    }
  ],
  "name": "Adress ",
  "settings": {
    "mouseViewMode": "drag",
    "autorotateEnabled": true,
    "fullscreenButton": false,
    "viewControlButtons": false
  }
};
