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

#### On level, 2 properties

Let property `foo` depend on `bar` like for example

```
makeC9r('A', {
  properties: {
    foo () {
      return this.bar
    },
    bar () {
      return 421
    },
  }
})
```


