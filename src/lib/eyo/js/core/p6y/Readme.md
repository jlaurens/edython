# Edython's properties

`p6y` stands for `property`.
This is a key concept of **edython**. It allows to store, share, observe informations.

## The basic behaviour

`eYo.p6y.BaseC9r` is the base constructor.
Any javascript object for which `isaP6y` returns `true` has the basic next behaviour. The remaining parts are built on top of that behaviour.

### Common attributes

Each property has 3 attributes.

| key | type | usage | comment |
|-----|------|-------|---------|
| `key_` | String | Unique identifier within the owner's scope | From `eYo.o3d.BaseC9r` |
| `owner__` | isaC9r | The owning object | From `eYo.o3d.BaseC9r` |
|`stored__` | * | The stored property | Maybe unused for pure computed properties |

### Default usage

	let onr = eYo.c9r.new() // owner
	let p6y = eYo.p6y.new('p6y', onr) // create the property
	p6y.value_ = 421 // set its value
	console.log(p6y.value) // read its value

Notice the trailing underscore in the affectation.
When omitted, it throws.

	p6y.value = 421 // throws

### Event hooks

Before a change, the value is validated. Some hooks are available for subclassers before, during and after the change.

Undo/redo management is eventually made at the value level.

The stored value is owned by only one property.
The may help in managing the memory.

## Extensions

Subclassers may change the storage management or the value management.
It is possible to completely override or just extend each management.

If we override the value management, we obtain a 'pure value computed property'. The storage is not used.

If we extend the value management by using the ` builtin` first argument, we obtain a 'value computed property'. The storage is used through this ` builtin` argument.

Apart from a 'pure value computed property'.
If we override the storage management, we obtain a 'pure storage computed property'. 
If we extend the storage management by using the ` builtin` first argument, we obtain a 'storage computed property'.

The different kinds of properties depend on the model used. When not ***standard value*** properties, we have both ***pure computed value*** and ***computed values*** properties.

### Pure computed value

the model contains a pure computed getter, a pure computed setter or both.

When the getter or setter is not given in the model,
it means that getting or setting is forbidden.

When there is no setter, reset has no meaning.

### Computed value

the model contains a computed getter, a computed setter or both.

Both will have a `builtin` argument in the first place.

When not ***pure computed value*** properties and ***standard store*** properties, we have both ***pure computed store*** and ***computed store*** properties.

### Pure computed store

the model contains both a pure computed getter and a pure computed setter.

### Computed store

the model contains both a computed getter and a computed setter.

### Start value

When a property has not a pure computed value, then it makes sense to provide an initialization value.
Initialization can occur lazily (only on demand).

A reset method is available when an initialization value has been provided.

## Implementation details

### Value management

Properties have 4 main methods inherited from their prototype:

1. `getValue`, the so called ***base high level getter***
1. `setValue`, the so called ***base high level setter***
1. `getStored`, the so called ***base low level getter***
1. `setStored`, the so called ***base low level setter***

They are sometimes overriden by the instance at runtime during a short amount of time to manage reentrancy.

Extended properties's prototype will possibly override these base methods definitely.

#### `getStored` and `setStored`
Default implementations are respectively the raw getter and setters of the `stored__` attribute.

#### `getValue ` and `setValue `
Default implementations are respectively the raw getter and setters of the `stored__` attribute.

### Start value.

By default, `getStartValue` just returns `eYo.NA`.

## The model

The model allows to change the basic behaviour.
Each model creates a subclass of the `eYo.p6y.BaseC9r` base constructor.

### Initialization

#### source

Another property or property alias.

#### value

Anything: the initial and restart value of the property. When a function, the return value is used as initial value.

#### lazy


| key | type | usage | comment |
|-----|------|-------|---------|
| `source` | p6y or alias | To create an alias to an existing property or alias | When given, all other keys are ignored |
| `value` | Anything | T | No `lazy` key is allowed |
| `lazy` |  |  |  |
| `reset` |  |  | When nly with builtin |

### Mutations

| key | type | usage | comment |
|-----|------|-------|---------|
| copy | Boolean | Whether the getter just returns a copy of the stored data | Only computed `get` allowed when true |
| get |  |  |  |
| set |  |  |  |
| get_ | ([builtin]) -> * | manage the `getStored` |  |
| set_ | ([builtin], after) -> ? | manage the `setStored` and possibly the `doResetValue` |  |

### Mutation hooks

| key | signature | usage | comment |
|-----|------|-------|---------|
| validate |  (before, after) -> * |  |  |
| willChange | (before, after) -> ? |  |  |
| atChange | (before, after) -> ? |  |  |
| didChange | (before, after) -> ? |  |  |
