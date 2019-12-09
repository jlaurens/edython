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
