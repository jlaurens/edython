# Edython's ui driver

The ui task are forwarded to a driver which is a delegate.

The main application owns a driver manager.
The driver manager owns different drivers for each kind of object that needs a specific UI. Each object indirectly owned by the application have a path to the driver manager and thus to its own specific driver.

The main driver just a plain objects with globally shared methods and properties. There is no possibility of instanciation.

This delegation design allows to make a faceless application rather efficiently because it separates the ui form the data model logic.