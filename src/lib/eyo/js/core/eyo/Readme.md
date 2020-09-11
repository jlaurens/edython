# Edyhon main object

## Naming convention

### Constructors
Names for constructors are title cased.
Some names are used with a dedicated meaning.

- `C3s` is a name designating a constructor
- `Super` is a name designating a constructor to be inherited from
- `Dflt` is a name designating a subclass of `eYo.c3s.Dflt`
- `Dlgt` is a name designating a subclass of `eYo.c3s.Dlgt`

**Exception**: bricks correspond to lower cased identifiers in the python grammar. The corresponding constructor is named after the identifier **with no case change**.

### Instances and variable
Names for objects that are not constructors (including functions) are sentence cased.

### Constants

Their names are upper cased.
The transition to upper case is in progress.

### Properties

- `foo.Bar` is a constructor
- `foo.Bar.SuperC3s_` is a constructor that `foo.Bar` directly inherits from
- `foo.Bar.SuperC3s_p` is a shortcut to `foo.Bar.SuperC3s_.prototype`

When constructor `foo.Bar` is created with the `makeC3s` utility,

- `foo.Bar_p` is a shortcut to `foo.Bar.prototype`
- `foo.Bar_s` is a shortcut to `foo.Bar.SuperC3s_p`

**Nota Bene:** See `eYo.inherits` 

## Namespaces

Namespaces are used to collect pieces of code with a common purpose.

`eYo` is the main object, it is the main namespace that contains absolutely everything related to edython.

A namespace is a singleton object. It is an instance of an unnamed class, and no other instance is expected.
For example, `eYo`, `eYo.brick`, `eYo.ui` are namespaces.

Each namespace has a uniquely identifying name,
which is exactly the string used in javascript.

Each namespace is created by a call to one of the `makeNS` functions or `eYo.provide`.
It belongs to exactly one namespace, with no reference loop.
It is an instance of a subclass of its creator's contructor.
For example, the namespace `eYo.model` is an instance of a subclass of `eYo`'s constructor.

Namespaces may contain other namespaces.
If `eYo.foo.bar` is a namespace then `eYo.foo` is also a namespace but the converse may not be true.

**Exceptions:**

- `DB` as shortcut for `DataBase` is a constructor name.

## Singletons
Namespaces are singletons, which means that their constructor is not available as is, only through the instances.
However, singletons'constructors may be strict subclasses of other singleton's constructors.

## The name
Each namespace is refered as `eYo.foo`, this string is the value of its `name` property.

## Creation

Each namespace singleton inherits a `makeNS` method, its purpose is to create a namespace which inherits from the receiver's constructor.

## Available namespaces

Here is a list of various namespaces created at initialization time, by key.

| key | purpose |
|-----|---------|
| `do` | For various tools |
| `protocol` | For protocol management |
| `decorate` | For decorator management |
| `model` | For model management |
| `factory` | For class management |
| `events` | For events management |
| `t3` | For brick types |
| `brick` | For bricks |
| `stmt` | For statement bricks |
| `expr` | For expression bricks |
| `ui` | For user interface |
| `consolidator` | For list consolidation |
| `driver` | For UI drivers |
| `fcls` | For faceless drivers |
| `fcfl` | For facefull drivers |
| `dom` | For dom drivers |
| `svg` | For Svg drivers |
