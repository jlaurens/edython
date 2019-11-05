# Managing the UI

The application can be faceless, in which case there is no UI at all (ideally at least). Moreover, the UI can be managed by diferent techniques.
Actually, the UI relies on `svg` related techniques, but we do not exclude different forthcoming techniques (openGL...). This separation allows more readability.

## Status of the document

In progress.

## Design

### The UI driver
Some javascript objects are modelling some objects that can have a UI or not.
These javascript objects have a `UI_driver_` property inherited from their owner.
That way, the top object owns the common UI driver of all the application.
That way we can choose what kind of UI policy we want at start time.
In the future we can imagine to change the driver dynamically
but there is no sufficient interest for that at first glance.

Any object that owns an object which needs access to the UI driver must declare a UI driver.

The UI driver has a bunch of `fooInit` and `fooDispose` methods both related to `eYo.foo` class and used while making the UI.

### Making the UI

The `makeUI` method is called to make the UI.
It is a one shot function that has no effect when there is already a UI.
In that function, the `eYo.foo` class will call the UI driver's `fooInit` method along with some other instructions.

In the `fooInit` is created the `div` object linked to the `div_` property.

### Deleting the UI

The `disposeUI` method is called to delete the UI.
It is a one shot function that has no effect when there is no UI.
In that function, the `eYo.foo` class will call the UI driver's `fooDispose` method along with some other instructions.

### The dom property

Any javascript object with a visual counterpart has an object property named `dom` where
the driver will store anything related to the dom. In general, it is a `div_` property pointing to a dom div.

This `dom` property is created by a call to `eYo.Dom.basicInit` and released in `eYo.Dom.basicDispose`.
A shortcut is provided through `eYo.Dom.decorateInit` and `eYo.Dom.decorateDispose`.

# Actual Dom
This is a draft. Only the 2 highest levels are faithfull.
The other ones are in discussion stage.
This tree corresponds to javascript objects, quite eponym.
```
<div id='eyo-application'>
  <div id='eyo-desk'>
    <div class='eyo-board'>
      <svg data-type='board'/>
      <svg data-type='scrollbars'/>
    </div>
    <div class='eyo-flyout'>
      <div class='eyo-flyout-control'/>
      <div class='eyo-flyout-toolbar'/>
      <div class='eyo-search'>
        <div class='eyo-search-toolbar'/>
        <div class='eyo-board'>
          <svg data-type='board'/>
        </div>
      </div>
      <div class='eyo-library'>
        <div class='eyo-library-toolbar'/>
        <div class='eyo-board'>
          <svg data-type='board'/>
        </div>
      </div>
      <div class='eyo-draft'>
        <div class='eyo-draft-toolbar'/>
        <div class='eyo-board'>
          <svg data-type='board'/>
        </div>
      </div>
      <svg data-type='vertical-scrollbar'/>
    </div>
  </div>
  <svg data-type='drag-board'/>
</div>
```
