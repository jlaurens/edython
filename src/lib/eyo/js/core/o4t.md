# Edython's objects

`o4t` stands for `object`.

Basic objects are instances of `eYo.C9r`, `eYo.Object` and `eYo.Widget`. We detail here the second one.

## Model

The model is expected to extend the basic behaviour of objects.
Expected template is:

```
{
    value: …,
    init: …,
    get: …,
    set: …,
    get_: …,
    set_: …,
}
```


## Properties

Properties are defined in different flavours : owned, cached, lazy, computed. Owned properties are used to model some ownership between two objects.

### Property initialization.

In general, properties do not depend on one another.
A contrario, some cached properties like `app` must be set after the owner is set. We can add some index to the property to order initialization processing.
We can also rely on some kind of automatic order detection.
And we can rely on lazyness.
This last design may lead to infinite loops: we must take care of reentrency.
