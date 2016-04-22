# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [0.0.1] - 2016-04-21

First version of the Core plug-in. All methods, events, etc are documented in the code via JSDoc.

### Added
#### Classes
- `Core` w/ constructor function that takes an array of other plug-ins to load.
- `Event` - Describes an event that may be passed around the system.
- `Plugin` - Describes a Modern Uploader plug-in.
- `Uuid` - generates version 4 UUIDs.
