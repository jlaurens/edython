# Edython's ui driver

The ui task are forwarded to a driver which is a delegate.

The main application owns a driver manager.
The driver manager owns different drivers for each kind of object that needs a specific UI. Each object indirectly owned by the application have a path to the driver manager and thus to its own specific driver.

The main driver just a plain objects with globally shared methods and properties. There is no possibility of instanciation.

This delegation design allows to make a faceless application rather efficiently because it separates the ui form the data model logic.

## Implementation details

### The namespaces

There are at least 4 namespaces: `eYo.Driver`, `eYo.Dom`, `eYo.Dom` and `eYo.Svg`.

* `eYo.Driver` is used to implement the overall control of driver's architecture. It provides some default behaviour with drivers and constructors.
* `eYo.Dom` is a driver architecture dedicated to dom technologies
* `eYo.Svg` is a driver dedicated to svg technologies, it extends the previous one.

### The manager and its drivers

The application owns a driver manager. Each object with a UI has a link to it, through its `app` computed property.

When a constructor `eYo.Foo` is created via `eYo.Constructor.UI.make`, the instance's `ui_driver` is a cached property returning the `Foo` property of the driver manager.

The managers 

### Creating a namespace

A namespace is just a static object.

At start, only the `eYo.Driver` namespace is available.
It provides us with a method `eYo.Driver.makeNamespace` to make a new namespace.

The purpose is to create a new namespace and populate it with a driver manager and a driver constructor at least.

A namespace can inherit elements from another namespace, for exemple `eYo.Svg` somehow extends `eYo.Dom`.
