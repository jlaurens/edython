# Edyhon properties

`p6y` stands for `property`.

Each object may contain properties.
There are different kinds of properties.

- owned
- valued
- cloned
- cached
- computed
- enumerated, by key or index
 
## Namespace

Property related code is gathered under `eYo.p6y` namespace.

## Nature

Each property has exactly one owner and a key such that in the property context, we always have
```
this.owner[this.key] === this
```

## Hooks
The main purpose is to allow some hooks while modifying the property.

## `eYo.p6y.Dflt`

Each property is represented by an instance of one of `eYo.Prop.Dflt` subclasses.
 
## The owner POV

Let `O` be an object with a property named `foo`.
Reading the property is made through a standard code `O.foo` or `O.foo_`. Setting the property is only made through `O.foo_ = bar`, if the property is not read only, of course.

The implementation is made through `O.foo_p`, which is an instance of one of the `eYo.p6y.Dflt` subclasses, owned by `O`.

## property POV

### owner and parent
The property has an owner an a parent.
The owner is the object who both originated the `new` instruction
that created the property and holds an handle on it.
The parent is the object whose properties section of the model contains the property model. It might not be the same.
The parent is the `this` object when functions from the model are called.

### values

The value of the property may be all kind of object.
For edython specific objects, we do not rely on GC mechanics and we explicitely dispose of objects when they are no longer used.
This is absolutely necessary for objects that modify the dom.
For that purpose, and it is not restricted to properties,
we make a soft link between an object and its owner through
the `eyo_o3r` key.

## The model

The model provides us with behaviours than we can hook into the standard setter.

## The property life

Creation time:

- allocation
- initialization
- first did change hook

The did change occurs after all the properties of the owner are initialized.

For each mutation:

- validate the change
- begin a change
- will change hook
- change
- at change hook
- did change hook
- end the change

If the change is not validated, the sequence stops before beginning the change.

The change is validated if the `validate` method does not return `eYo.INVALID`.

The difference between at change and did change hooks is that the latter is always run whereas the former may not run due to exception throws.


## Model

### Shortcuts

Each of the `validate`, `willChange`, `atChange`, `didChange` model function follows one of the templates

```
foo (before, after) {
	...
}
```
In the model, both formal parameters must have **exactly** that name.
In order to simplify the coder life, any formal parameter can be omitted.

The `init` model method has the following template:

```
init () {
	return ...
}
```
For the sake of readability

```
init: foo,
```
is replaced by
```
init () {
	return bar
}
```
Where `bar` is the value of `foo`.
For example, all the properties created with the same model containing

```
init: new function() {},
```
will start with a unique common value whereas all the properties created with the same model containing

```
init () {
	return new function() {}
},
```
will start with a globally unique value different from each other.

## Some implementation details

From bottom up.

1. `stored__`: the lowest level
2. `value__`: `setStored` setter
3. `value_`: `setValue` setter with validation and hooks
4. `value`: read only

The `getValue` getter can be overriden by the model with key `get`. Enventually lazy initialization.

The `setValue` setter can be overriden by the model with key `set`.

The `getStored ` getter can be overriden by the model with key `get_`. Useful for computed properties. Defaults implementation simply gets the `stored__`.

The `setStored ` setter can be overriden by the model with key `set_`. Useful for computed properties. Defaults implementation simply sets the `stored__`.

### Model details

| keys | value | usage |
|---|---|---|
| value | | |
| lazy | | |
| reset | | |
| dispose | | |
| validate | | |
| copy | | |
| get | | |
| set | | |
| get_ | | |
| set_ | | |
| willChange | | |
| atChange | | |
| didChange | | |
