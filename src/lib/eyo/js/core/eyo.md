# Edyhon main object

## Namespaces

`eYo` is the main object, it is the main namespace that contains absolutely everything related to edython.

A namespace is a singleton object. It is an instance of an unnamed class, and no other instance is expected.
For example, `eYo`, `eYo.Brick`, `eYo.UI` are namespaces.

Each namespace has a uniquely identifying name,
which is exactly the string used in javascript.

Each namespace is created by a call to one of the `makeNS` functions.
It belongs to exactly one namespace, with no reference loop.
It is an instance of a subclass of its owner's contructor.
For example, the namespace `eYo.Model` is an instance of a subclass of `eYo`'s constructor.
