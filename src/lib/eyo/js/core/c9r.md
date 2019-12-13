# Edython's class management

Various `makeClass` function are utilities to create class objects with 
properties and methods given in an object.
The idea is to use a rather straightforward syntax.

## Where the classes are stored,

Classes are spread between various name spaces.
Each class belongs to exactly one of the known namespaces.

## Class extensions

Each class is extended through a property named `eyo`.
This name is sufficiently weird to avoid collisions.
Each `eyo` object is an instance of `eYo.Dlgt` or one of its
subclasses.

This extension knows the namespace owning the class.
It also knows the unique string identifying the class: its name.
The name is exactly the string as it appears in javascript to reference the class.

## Model

New classes are built with models.
A model allows to declare properties and to customize standard methods in a rather straightforward manner.

The model used to create a class is stored in its `eyo` delegate.

The model stored is not exactly the argument given to the `makeClass` function.

A model is a tree, based on objects.

## Subclassing and model

If `Foo` inherits from `Bar`, then model of `Foo` also from the model of `Bar`.

## Base classes

Each namespace `ns` contains `ns.Dflt` which is the root class for all thge classes in that namespace. It also contains `ns.Dlgt` which the root class of the constructor delegats in that namespace.

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
  owned: IDENTIFIER || [IDENTIFIER] || Owned properties dictionary ,
  computed: {
    key: Function / getter || {
      get: ?Function,
      set: ?Function,
      get_: ?Function,
      set_: ?Function,
      get__: ?Function,
      set__: ?Function,
      validate () {},
      willChange () {},
      didChange () {},
    }
  },
  link: {
    key: {
      value: VALUE,
      init () {},
      get () {},
      set () {},
      get_ () {},
      set_ () {},
      validate () {},
      willChange () {},
      didChange () {},
    }
  }, 
  cached: {
    key: init Function || {
      lazy: Boolean,
      value: VALUE,
      init () {},
      validate () {},
      willChange () {},
      didChange () {},
    }
  },
  clonable: {
    key: init Function || {
      lazy: Boolean,
      value: VALUE,
      init () {},
      validate () {},
      willChange () {},
      didChange () {},
    }
  },
}
```
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