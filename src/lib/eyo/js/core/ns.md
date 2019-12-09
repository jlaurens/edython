# Namespaces for Edython

Namespaces are used to collect pieces of code with a common purpose.

## Singletons
Namespaces are singletons, which means that their constructor is not available as is, only through the instances.

## The name
Each namespace is refered as `eYo.ns.Foo`, it is the value of its `name` property.

## Creation

Each namespace singleton has a `make` method, its purpose is to create a namespace which inherits from the receiver.

## Available namespaces

Here is a list of various namespaces created at initialization time, by key.

| key | purpose |
|-----|---------|
| `Brick` | For bricks |
| `UI` | For user interface |
| `Model` | For model managements |
| `Consolidator` | For list consolidation |
| `Driver` | For UI drivers |
| `Fcls` | For faceless drivers |
| `Dom` | For dom drivers |
| `Svg` | For Svg drivers |


## Comments
Technically the root namespace is `eYo`.

