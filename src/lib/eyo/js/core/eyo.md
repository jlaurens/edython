# Edyhon main object

## Namespaces

Namespaces are used to collect pieces of code with a common purpose.

`eYo` is the main object, it is the main namespace that contains absolutely everything related to edython.

A namespace is a singleton object. It is an instance of an unnamed class, and no other instance is expected.
For example, `eYo`, `eYo.Brick`, `eYo.UI` are namespaces.

Each namespace has a uniquely identifying name,
which is exactly the string used in javascript.

Each namespace is created by a call to one of the `makeNS` functions.
It belongs to exactly one namespace, with no reference loop.
It is an instance of a subclass of its creator's contructor.
For example, the namespace `eYo.Model` is an instance of a subclass of `eYo`'s constructor.


## Singletons
Namespaces are singletons, which means that their constructor is not available as is, only through the instances.

## The name
Each namespace is refered as `eYo.Foo`, it is the value of its `name` property.

## Creation

Each namespace singleton inherits a `makeNS` method, its purpose is to create a namespace which inherits from the receiver's constructor.

## Available namespaces

Here is a list of various namespaces created at initialization time, by key.

| key | purpose |
|-----|---------|
| `Do` | For various tools |
| `Protocol` | For protocol management |
| `Decorate` | For decorator management |
| `Model` | For model management |
| `Factory` | For class management |
| `Events` | For events management |
| `T3` | For brick types |
| `Brick` | For bricks |
| `Stmt` | For statement bricks |
| `Expr` | For expression bricks |
| `UI` | For user interface |
| `Consolidator` | For list consolidation |
| `Driver` | For UI drivers |
| `Fcls` | For faceless drivers |
| `Dom` | For dom drivers |
| `Svg` | For Svg drivers |
