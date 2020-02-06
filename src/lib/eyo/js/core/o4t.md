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

Properties are defined in two flavours : owned and valued. Owned properties are used to model some ownership between two objects.
