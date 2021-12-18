# Light Controller
## Overview
Provides a Web API interface for controlling devices attached to the GPIO pins on the Raspberry Pi.

Currently 4 types of light are supported:
-   light-basic (simple on/off)
-   light-dimmable (Single channel PWM light)
-   light-rgb (RGB Channel PWM light)
-   light-ws2812b (Addressable LED Light Strip (WS2812B chip))

## Possible Future Updates
- Animations for addressable LED strips
    - "scroll"
    - "bounce"
    - "random" - Randomly pick out of the available colours. Maybe include a segment size to break the LED strip into segments
    - Blob - "Like a lava lamp, random points on the strip will light up (along with the LEDs next too it with a falloff).
        - Maybe include a value to change the average size of the blobs.
- Simplify Effects
    - Modify all effects by removing the affectsBrightness/affectsColor values (no effects should affect brightness, only pixels/color).
    - Remove the NoEffect option. To cancel an effect, simply pick a new one or a solid colour.
    - Allow effects to be paused when lights are turned off and resumed when turned on.
        - Stop the cancellation of effects on state change
    - Consider generalising motions to work with older device types and convert the old effects into motions (i.e. for flash/pulse/rainbow effects)
        - Then consider removing the Effects classes or integrate it with the Scene class.
- State
    - Make the state/brightness/colour/pixels/effects persist and restored upon restart.

## Run as service (Raspberry Pi - systemctl)
Run the following commands to register the service with systemd to allow it to start with the OS:

``` bash
# Create a symbolic link between the service definition and the systemd folder.
sudo ln -s /usr/lib/node_modules/@jms777/light-controller/install/light-controller.service /etc/systemd/system/

# Register then start then service
sudo systemctl enable light-controller.service
sudo systemctl start light-controller.service
```

## Device File
This should be located in the /dist folder and named `devices.json` (if you want to change this you can update the path to the file in the `/dist/.env` file).

This file contains required information for your devices, i.e. which pins your lights are connected too, or the number of pixels on an addressable LED strip.

The layout for each type of device is as follows:
```
{
    "devices": [
        {
            "id": 1,
            "type": "light-basic",
            "pins": {
                "main": 1
            }
        },
        {
            "id": 2,
            "type": "light-dimmable",
            "pins": {
                "main": 2
            }
        },
        {
            "id": 3,
            "type": "light-rgb",
            "pins": {
                "red": 3,
                "green": 4,
                "blue": 5
            }
        },
        {
            "id": 4,
            "type": "light-ws2812b",
            "physicalInfo": {
                "pin": 18, // WS2812B lights can only be connected to pins 10, 12, 18 and 21
                "pixelCount": 100 // The number of LEDs on your LED strip
            }
        }
    ]
}
```

# Endpoints (v2)

## Device Info
Get all devices and their properties:
```
GET /api/v2/devices

response.body: {
    "success": boolean,
    "message": string,
    "devices": [
        {
            "id": number,
            "type": string, // Should match one the available types
            "state": boolean, // (any light)
            "brightness": number, // (0 - 100)(light-dimmable and light-rgb)
            "hsv": { // (light-rgb only)
                "h": number, // Hue in degrees
                "s": number, // Saturation (0 - 100)
                "v": number, // Brightness (0 - 100)
            },
            "channels": {
                "<channel name>": { // Channel will typically be 'main', 'red', 'green' or 'blue'
                    "pin": number,
                    "value": number // (0 - 1)
                },
                "<channel name>": { // Channel will typically be 'main', 'red', 'green' or 'blue'
                    "pin": number,
                    "value": number // (0 - 1)
                }
            },
            "pixels": [
                ... // List of RGB values representing each pixel on the LED strip (WS2812B only)
            ]
        }
    ]
}
```

Get a specific device's properties:
```
GET /api/v2/devices/{id}

response.body: {
    "success": boolean,
    "message": string,
    "device": {
        "id": number,
        "type": string, // Should match one the available types
        "state": boolean, // (any light)
        "brightness": number, // (0 - 100)(light-dimmable and light-rgb)
        "hsv": { // (light-rgb only)
            "h": number, // Hue (0 - 360)
            "s": number, // Saturation (0 - 100)
            "v": number, // Brightness (0 - 100)
        },
        "channels": {
            "<channel name>": { // Channel will typically be 'main', 'red', 'green' or 'blue'
                "pin": number,
                "value": number // (0 - 1)
            },
            "<channel name>": { // Channel will typically be 'main', 'red', 'green' or 'blue'
                "pin": number,
                "value": number // (0 - 1)
            }
        },
        "pixels": [
            ... // List of RGB values representing each pixel on the LED strip (WS2812B only)
        ]
    }
}
```

## State
Set the state of the light to on/off.
```
PUT /api/v2/lights/state/{id}

request.body: {
    "state": boolean
}
```

## Brightness
Set the brightness of the light. Valid range 0 - 100.
```
PUT /api/v2/lights/brightness/{id}

request.body: {
    "brightness": number
}
```

## Colour
Set the colour of the light in the HSV colour space. Valid values for hue are 0 - 360, and valid values for saturation and value are 0 - 100.
```
PUT /api/v2/lights/colour/{id}

request.body: {
    "hsv": {
        "h": number,
        "s": number,
        "v": number,
    }
}
```

## Pixels - WS2812B only
Used to set the individual pixels of an addressable LED strip. Each pixel is defined with an RGB colour, valid channel values are 0 - 255.

```
PUT /api/v2/lights/pixels/{id}

request.body: {
    "pixels": [
        {"r": 255, "g": 0, "b": 128},
        {"r": 255, "g": 0, "b": 0},
        {"r": 0, "g": 255, "b": 128},
        ...
    ]
}
```

# Endpoints (v3)
## General Purpose **(WIP)** - WS2812B only
Currently includes a more advanced colour selection, which will automatically apply a gradient across the LED strip if mulitple colours are supplied.

If you specify one colour (HSV) in the "colours" array parameter the light will be set to that colour, if multiple colours are specified it will
calculate a gradient between all the colours.
```
PUT /api/v3/lights/{id}

request.body: {
    "colours": [
        { "h": 360, "s": 100, "v": 100 },
        { "h": 120, "s": 100, "v": 100 },
        { "h": 240, "s": 100, "v": 100 }
    ],
}
```

## Presets - WS2812B only
It's possible to save the current pixel values for the WS2812B device and load them at a later time type using these endpoints.

Note: Presets are stored separately for each device.

List Presets
```
GET /api/v3/lights/{id}/presets

Response - Array (string[]) of preset names.
```

Load Preset
```
PUT /api/v3/lights/{id}/presets

request.body: {
    "name": "<preset name>"
}
```

Save Preset
```
PUT /api/v3/lights/{id}/presets/save

request.body: {
    "name": "<preset name>"
}
```

Delete Preset
```
DELETE /api/v3/lights/{id}/presets/delete

request.body: {
    "name": "<preset name>"
}
```