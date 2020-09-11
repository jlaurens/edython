# Edython's owned objects

`o3d` stands for `owned`.

Basic objects are instances of `eYo.C3s`, `eYo.Object` and `eYo.Widget`. We detail here the second one.

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
