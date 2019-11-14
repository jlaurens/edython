# Edython's constructor and property management

The `eYo.Constructor` provides us with a convenient method to create constructors. It takes care of links, owned properties, cached properties, clonable owned properties.

Each constructor created like that also
contains a delegate (an instance of `eYo.Constructor.Dlgt`) which helps in managing those properties.