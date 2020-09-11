# Class management in Edython

Class declaration has been designed to be highly flexible,
in order to allow easy refactoring and meta programming.

Various `makeC3s` function are utilities to create class objects with 
properties and methods given in an model object.
The idea is to use a rather straightforward syntax.

## Namespaces

`eYo.foo` namespace are used to collect technologies dedicated to some definite purpose. `eYo.c3s` is the namespace for the constructors, `eYo.dlgt` is the namespace for the constructor delegates.

## Class extensions through delegation.

Each constructor is extended through a property named `eyo`.
This name is sufficiently weird to avoid collisions.
Each class is a descendant of `eYo.C3s.BaseC3s` whereas `eyo` object is an instance of `eYo.dlgt.BaseC3s`.

This extension knows the namespace owning the class.
It also knows the unique string identifying the class: its name.
The name is exactly the string as it appears in javascript to reference the class.

## Infinite loop

There is a possible infinite list :

object[0] -> constructor[0] -> eyo[1] -> constructor[1] -> eyo[2] -> constructor[2] -> eyo[3] -> constructor[3] -> ...

This list is turned into an infinite loop.

* object[0] is not an instance of `eYo.dlgt.BaseC3s`.
* eyo[1] is an instance of a subclass of `eYo.dlgt.BaseC3s`
* eyo[i] is the same instance of `eYo.dlgt.BaseC3s` for i>1

`eYo.dlgt.BaseC3s` is instantiated only once.

This means that constructor[2] does not depend on object[0]
and that since eyo[3], all the delegates are the same.

With the `eyo` property shortcut

* `object.eyo` is an instance of an unexposed subclass of `eYo.dlgt.BaseC3s`
* `object.eyo.eyo` is an instance of `eYo.dlgt.BaseC3s`
* `object.eyo.eyo.eyo` is another instance of this unexposed class which is the same for all objects
* `object.eyo.eyo.eyo.eyo...` is exactly the same instance

## Where the classes are stored,

Classes are spread between various name spaces.
Each class belongs to exactly one of the known namespaces.

A namespace is an instance of some unexposed constructor,
this is why it is named lowercased.

A namespace `eYo.foo` may inherit from another namespace `eYo.bar`
in the sense that the former's constructor is a subclass of the latter's one.

TO BE CONTINUED.

In general, a namespace `eYo.foo` owns two default classes.


## Model

New classes are built with models.
A model allows to declare properties and to customize standard methods in a rather straightforward manner.

The model used to create a class is stored in its `eyo` delegate.

The model stored is not exactly the argument given to the `makeClass` function.

A model is a tree, based on objects.

## Subclassing and model

If `Foo` inherits from `Bar`, then model of `Foo` also from the model of `Bar`.

## BaseC3s classes

Each namespace `ns` contains `ns.BaseC3s` which is the root class for all thge classes in that namespace. It also contains `ns.Dlgt` which the root class of the constructor delegats in that namespace.

## Class models for Edython

In progress.
See also the class documentation.

### A model is a tree
```
base = {
  foo: {
    bar: blablabla
  },
}
```

### Model inheritance

Given

```
model = {}
```
If `model` inherits from `base`, then `model.foo === base.foo`.

Given

```
model = {
  foo: {},
}
```
If `model` inherits from `base`, then `model.foo !== base.foo` but `model.foo.bar !== base.foo.bar`.

The `init` and `dispose` functions of the model are used before inheritance is built.
They are used to create an eponym method in the newly created prototype.
This methods calls the inherited one if any, such that the method of the
to be inherited model is really used.

### model persistency

A selection of the model content is stored in the delegate of the constructor. For example, both `init` and `dispose` functions are not recorded in the delegate.

### Model content

#### Owned properties dictionary
An owned property is an owned object. It will receive `init` and `dispose` messages.

```
Owned properties dictionary ::= {
  (key: owned property dictionary,)*
}
```
Each key represents an owned property.

```
Owned property dictionary ::= {
  value: VALUE,
  init () {},
  validate () {},
  willChange () {},
  didChange: () {},
}
```

#### `init` and `dispose` functions


#### General objects
Model template for most objects except bricks.

```
base_template = {
  init () {} || {
    begin () {},
    end () {},
  },
  dispose () {},
  ui: {
    init () {},
    dispose () {},
  },
  properties: {
    key: Function / getter || {
      value: ?Function,
      lazy: ?Function,
      reset () {},
      get: ?Function,
      set: ?Function,
      get_: ?Function,
      set_: ?Function,
      get__: ?Function,
      set__: ?Function,
      validate () {},
      willChange () {},
      atChange () {},
      didChange () {},
    }
  },
  aliases: {
    source: destination
  }, 
}
```
NB: there is a possible need for a consolidation layer.
The purpose is to separate the allocation and the initialization.
Allocation should be used to declare various variables whereas initialization should be used to give values.
The problem is circular initialization.
One possibility is to use an |order| field like for brick models.
Another possibility is to use a (possibly external) code analyzer 
to detect which property should be initialized first.
Subclassing may help in the sense that inherited properties should be setup first. The question is about property enumeration that must be ordered. There should be as many enumerations as possible orders.

#### Bricks

Template for Statements, same thing plus

```
model_stmt = {
  // init () {},
  deinit () {},
  xml: {
    types: TYPE || [TYPE], // last is expected
    attr: '@',
  },
  data: {
    key: {
      order: VALUE,
      all: TYPE || [TYPE], // last is expected
      main: BOOLEAN,
      init () {} || VALUE, !!! are function supported ?
      placeholder: STRING,
      validate () {} || false || true,
      consolidate () {},
      validateIncog () {},
      willChange () {},
      isChanging () {},
      didChange () {},
      willLoad () {},
      didLoad () {},
      fromType () {},
      fromField () {},
      toField () {},
      noUndo: true,
    }
  },
  slots: {
    key: {
      order: VALUE,
      fields: {
        start: '(',
        end: ')',
        label: String || {  // last is expected ?????
          reserved: ':'
        },
        bind: {
          validate: true,
          endEditing: true,
          reserved: '.',
          separator: true,
          variable: true,
          willRender () {},
        },
      },
      check:  BRICK_TYPE || [BRICK_TYPE] || () => {}, // last is expected
      promise: eYo.T3.Expr.value_list,
      validateIncog () {},
      accept () {},
      didConnect () {},
      didDisconnect () {},
      wrap: TYPE,
      xml: (() => {} || true) || false||  { first
        accept () {},
      },
      plugged: eYo.T3.Expr.primary,
    },
  },
  head: BRICK_TYPE || [BRICK_TYPE] || () => {} || { // last is expected
    check:  BRICK_TYPE || [BRICK_TYPE] || () => {}, // last is expected
  },
  left: BRICK_TYPE || [BRICK_TYPE] || () => {} || { // last is expected
    check:  BRICK_TYPE || [BRICK_TYPE] || () => {}, // last is expected
  },
  right: BRICK_TYPE || [BRICK_TYPE] || () => {} || { // last is expected
    check: BRICK_TYPE || [BRICK_TYPE] || () => {}, // last is expected
    fields: {
      label: { // don't call it 'operator'
        reserved: STRING,
        hidden: BOOLEAN,
      }
    }
  },
  suite: BRICK_TYPE || [BRICK_TYPE] || () => {} || { // last is expected
    check:  BRICK_TYPE || [BRICK_TYPE] || () => {}, // last is expected
  },
  foot: BRICK_TYPE || [BRICK_TYPE] || () => {} || { // last is expected
    check:  BRICK_TYPE || [BRICK_TYPE] || () => {}, // last is expected
    required: BOOLEAN,
  }
}
```

#### Expressions

Expressions are statements with an `out` magnet.

```
model_expr = {
  out: BRICK_TYPE || [BRICK_TYPE] || () => {} ||  { // last is expected
    check:  BRICK_TYPE || [BRICK_TYPE] || () => {}, // last is expected
  },
}
```
#### Lists

Lists are expressions with a consolidator.
```
model_list = {
  list: {
    consolidator: CONSOLIDATOR_TYPE,
    check:  BRICK_TYPE || [BRICK_TYPE] || () => {}, // last is expected
    unique: BRICK_TYPE,
    mandatory: NUMBER,
    presep: STRING,
    can_comprehension: BOOLEAN,
    all: BRICK_TYPE || [BRICK_TYPE], // last is expected
    placeholder: STRING,
  }
}
```
Problem: it may make sense to change the list consolidator on the fly.