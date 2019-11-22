# Edython's ui driver

The ui task are forwarded to a driver which is a delegate.

The main application owns a driver manager.
This driver manager owns in turn different drivers for each kind of object that needs a specific UI. Each object indirectly owned by the application have a path to the driver manager and thus to its own specific driver.

This delegation design allows to make a faceless application rather efficiently because it separates the ui from the data model logic.

## Implementation details

### The namespaces

There are at least 4 namespaces: `eYo.Driver`, `eYo.Fcls`, `eYo.Dom` and `eYo.Svg`.

* `eYo.Driver` is used to implement the overall control of driver's architecture. It provides some default behaviour with drivers and constructors.
* `eYo.Fcls` is a driver architecture dedicated to faceless applications
* `eYo.Dom` is a driver architecture dedicated to dom technologies
* `eYo.Svg` is a driver dedicated to svg technologies, it extends the previous one.

### The manager and its drivers

The application owns a driver manager. Each object with a UI has a link to it, through its `app` computed property.

When a constructor `eYo.Foo` is created via `eYo.Constructor.UI.make`, the instance's `ui_driver` is a cached property returning the `Foo` property of the driver manager.

All the driver classes are created with a call to some `makeDriverClass`. When created, a driver manager instance owns an instance of all the driver classes created that way.

<span style="color:red">**LIMITATION:**</span>
A driver class may have any name, except `Mgr` and `Dlgt`. Instead, use full name `Manager`, `Delegate` or some other name like that.

### Creating a namespace

A namespace is just a static object.

First, only the `eYo.Driver` namespace is available.
It provides us with a method `eYo.Driver.makeMgrClass` to make a new manager class in an existing namespace.

The purpose is to populate the namespace with a driver manager, a default driver and a driver class maker at least.

### Extension

A namespace can inherit elements from another namespace, for exemple `eYo.Svg` somehow extends `eYo.Dom`, which in turn extends `eYo.Fcls`.

The `eYo.Driver.makeMgrClass` also creates a local maager class maker. At some point, we have both
`eYo.Fcls.makeMgrClass`, 
`eYo.Dom.makeMgrClass` and
`eYo.Svg.makeMgrClass` where extension is implemen ted.

`eYo.Svg` extends `eYo.Dom` means that the driver `eYo.Svg.Foo` is a subclass of `eYo.Dom.Foo`.

### Creating a driver class

The `eYo.Driver.makeMgrClass` also creates a driver class maker. At some point, we have both
`eYo.Fcls.makeDriverClass`, 
`eYo.Dom.makeDriverClass` and
`eYo.Svg.makeDriverClass`.


