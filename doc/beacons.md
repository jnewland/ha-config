# Beacons

## Objective

Provide presence data with room/floor granularity to provide additional context to automations

## Resources

* [Beacons](https://www.amazon.com/iBeacon-Mini-Bluetooth-Programmable-Beacon/dp/B019G0VVZC): `minew123` is the default password
* [iOS App for configuration](https://itunes.apple.com/us/app/beaconset/id1052655664?mt=8)
* [Home Assistant Docs](https://home-assistant.io/docs/ecosystem/ios/location/)

### Initial setup

DOCS TODO

### Setup of each new beacon

#### Prep

* Install [BeaconSet](https://itunes.apple.com/us/app/beaconset/id1052655664?mt=8) on your iOS device.
* Plug in beacon (I've been powering them with old iPhone wall warts).
* Copy UUID (`74278BDA-B644-4520-8F0C-720EAF059935`) to iOS clipboard.
* Open this page on your laptop. BeaconSet doesn't do a good job of maintaining a connection if you switch away from it while editing a beacon, so you'll want to be able to refer to these instructions.

### Configuring the beacon

* Open BeaconSet on your iOS device.
* Set the value of `name` to something meaningful.

* Set UUID to:

```
74278BDA-B644-4520-8F0C-720EAF059935
```

* Set minor to:

```
10001
```

* Set minor to `zones.last['minor'] + 1`, where `zones` is https://github.com/jnewland/ha-config/blob/master/customize/zones.yaml.
* Tap "Save" on the Beacon's Config view. Make sure you get a "write successful" message.
* Update https://github.com/jnewland/ha-config/blob/master/zone.yaml and https://github.com/jnewland/ha-config/blob/master/customize/zones.yaml to match.
* Deploy
* Open iOS app, go to settings. Tap save. Go to location settings to confirm.
* :ice_cream:

### Tuning power

* Set power to the lowest setting
* Slowly increase as necessary
