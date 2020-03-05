# Edython attributes

There are two kinds of attributes: data and properties.

Here `p6y` stands for `property`.

Each object may contain properties.
There are different kinds of properties.

- owned
- valued
- cloned
- cached
- computed
- enumerated, by key or index

A `data` attribute is very similar to a property, except that it should interacts with the user interface.
 
## Namespaces

Attributes related code is gathered under `eYo.attr` namespace.
Property related code is gathered under `eYo.p6y` namespace.
Data related code is gathered under `eYo.data` namespace.

## Nature

Each attribute, whether a property or a data, has exactly one owner and a key such that in the attribute context, we always have
```
this.owner[this.key] === this
```

## Hooks
The main purpose is to allow some hooks while modifying the attribute.

## `Base`

Each property is represented by an instance of one of `eYo.p6y.Base` subclasses whereas each data is represented by an instance of one of `eYo.data.Base` subclasses.

## Properties

## Data

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

## Some implementation details for properties

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

## More about data

A data object manages the state of an user interface widget.
More precisely, data objects are owned by bricks and maintain their visual aspect.
All the data objects may not be in any available state due to overall consistency. Some changes to data objects may cascade to other data objects.

### Overall state consistency

When a brick state consistency comes into play, a change to a data object must be done through a `doChange` message. This informs the owning brick that its state should not be considered as consistent. Eventually, some other data may change accordingly. Once any change is done, the owning brick is informed. The brick is considered in a consistent state once the very first change is complete.

For that purpose, any brick has a `changer` object maintaining the level of inconsistency. Level 0 means no inconsistency. Each time a data change is initiated, the level increases by one, conversely it decreases by one each time a data change is complete.

### Implementation details

#### the data content

The data object stores its content in the `stored__` attribute. It points to a base object, string, number, array, map, nothing more complicated. In particular, memory management is mainly left to the garbage collector.

