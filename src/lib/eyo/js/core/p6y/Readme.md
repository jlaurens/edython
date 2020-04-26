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

Notice the ending underscore in the affectation.
When omitted, it throws.

	p6y.value_ = 421 // throws

## Implementation details

Properties have 4 main methods inherited from their prototype:

1. `getValue`, the so called ***base high level getter***
1. `setValue`, the so called ***base high level setter***
1. `getStored`, the so called ***base low level getter***
1. `setStored`, the so called ***base low level setter***

They are sometimes overriden at runtime during a short amount of time to manage reentrancy.

Extended properties's prototype will possibly override these base methods definitely.

### `getStored` and `setStored`
Default implementations are respectively the raw getter and setters of the `stored__` attribute.

### `getValue ` and `setValue `
Default implementations are respectively the raw getter and setters of the `stored__` attribute.

## The model

The model allows to change the basic behaviour.
Each model creates a subclass of the `eYo.p6y.BaseC9r` base constructor.

### Initialization

| key | type | usage | comment |
|-----|------|-------|---------|
| `source` | p6y or alias | To create an alias to an existing property or alias | When given, all other keys are ignored |
| `value` | Anything | The initial value of the property. When a function, the initial value is what returns the function | No `lazy` key is allowed |
| `lazy` |  |  |  |

### Mutations

| key | type | usage | comment |
|-----|------|-------|---------|
| reset |  |  |  |
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
