# Edython's class management

`dlgt` implements class delegation.

Each constructor has a delegate with various metadata.
This allows to gather all extensions in one place without risking name conflicts. `SuperC9r` is an exception to that design.

Each delegate is a singleton.
If a class inherits form a super class, then the delegate also inherits its methods from the super class's delegate. Not necessary all its data.