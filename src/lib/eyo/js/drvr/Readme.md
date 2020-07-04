# Edython's ui driver

The ui task are forwarded to a driver which is another kind of delegate. The driver only has methods and its state needs not mutate at runtime.

The main application owns a driver manager which can change at runtime.
This driver manager owns in turn different drivers for each kind of object that needs a specific UI. Each object indirectly owned by the application have a path to the driver manager and thus to its own specific driver.

This delegation design allows to make a faceless application rather efficiently because it separates the ui from the data model logic.

## Implementation details
### Names
All the methods of the driver follow the same naming convention:

	do_whathever(object, ...)

This method is called from `object.whatever(...$)`. At least there are two methods: `do_initUI` and `do_disposeUI`.

### The namespaces

There are at least 5 namespaces: `eYo.driver`, `eYo.fcls`, `eYo.fcfl`, `eYo.dom` and `eYo.svg`.

* `eYo.driver` is used to implement the overall control of driver's architecture. It provides some default behaviour with drivers and constructors.
* `eYo.fcls` is a driver architecture dedicated to faceless applications
* `eYo.fcfl` is an abstract driver architecture dedicated to facefull applications
* `eYo.dom` is a driver architecture dedicated to dom technologies
* `eYo.svg` is a driver dedicated to svg technologies, it extends the previous one.

### The manager singleton.

### The manager and its drivers

The application owns a driver manager. Each object with a UI has a link to it, through its `app` computed property.

When a constructor `eYo.Foo` is created via some `makeC9r` method, the instance's `driver` is a cached property returning the `Foo` property of the driver manager.

All the driver classes are created with a call to some `newDriverC9r`. When created, a driver manager instance owns an instance of all the driver classes created that way.

### Creating a namespace

A namespace is just a static object.

First, only the `eYo.driver` namespace is available.
It provides us with a method `makeMngr` to make a new singleton in each derived namespace.

The purpose is to populate the namespace with a driver manager, a default driver and a driver class maker at least.

### Extension

A namespace can inherit elements from another namespace, for exemple `eYo.svg` somehow extends `eYo.Ddm`, which in turn extends `eYo.fcfl` which itself is an extension of `eYo.fcls` up to `eYo.driver`.

`eYo.svg` extends `eYo.dom` means that the driver `eYo.svg.Foo` is a subclass of `eYo.dom.Foo`.

The `eYo.driver.makeMngr` also creates a local manager class maker. At some point, we have both
`eYo.fcls.makeMngr`, 
`eYo.fcfl.makeMngr`, 
`eYo.dom.makeMngr` and
`eYo.svg.makeMngr` where extension is implemented.

These are one shot function for each namespace.

### The drivers

#### Creating a driver class

The `eYo.Driver.makeMngr` also creates a driver class maker. At some point, we have both
`eYo.fcls.newDriverC9r`, 
`eYo.fcfl.newDriverC9r`, 
`eYo.dom.newDriverC9r ` and
`eYo.svg.newDriverC9r `.

#### The multiple inheritance problem.

Suppose we start with a driver constructor `eYo.dom.Bar`, then we have

* `eYo.dom.Foo` is a subclass of `eYo.dom.Bar`
* `eYo.svg.Bar` is another subclass of `eYo.dom.Bar`

Then `eYo.svg.Foo` should be some kind of subclass of both `eYo.dom.Foo` and `eYo.svg.Bar`.

In order to obtain some kind of multiple inheritancy, a driver is a proxy.
