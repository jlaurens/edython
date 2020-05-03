# Edyhon model object

We have base classes to modelize large classes of objects.
Variations targeted to smaller classes are modelized by subclassing, based on so called ***model object***.

## Main entries

* `eYo.isModel(what)` to see whether `what` *is* a ***model object***.
* `var mf = new eYo.model.Format(parent, key, fallback)`, this ***model format*** object manages the acceptable structure of a model.
* `mf.allow(...)` is used to allow some key/value pairs
* `mf.validate(path, model, key)` is used to validate a given model.
