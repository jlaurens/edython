# Changer for Edython

A changer object

* manages the consistency of the state of an object
* keeps track of the change count
* adds memoization

## State consistency

When the state of an object is determined by different attributes, the question of consistency comes into play. Sometimes, change only one attribute puts the object in an inconsistent state, and another attribute must be changed accordingly on order to recover a consistent state. A changer has a `level` attribute that somehow measures the inconsistency level. When this attribute is 0, there is no inconsistency.

A changer can thus monitor the consistency of its owner's state. Each change of the owner's state must be encapsulated between `begin`/`end` sequence.

## Change count

A changer object keeps track of consistent changes on the state of an object. This count always increments by one.

## Change step

The change count is recorded when ths owner's `changeStepFreeze` attribute is truthy. 