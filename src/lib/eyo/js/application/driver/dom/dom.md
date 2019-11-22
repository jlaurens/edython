# Edython's ui dom driver

Abstract driver based on the dom.
This piece of code exists for an eventual portability to another language...

## Facts
When creating the UI of an object, the driver creates an property named `dom`. It will contains links to dom elements like divs, buttons...

## Caveats
The `makeSubclass` method helps in createing a subclass of the default driver. Beware that `basicInitUI` and `basicDisposUI` cannot be sunclassed.