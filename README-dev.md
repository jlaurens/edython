# Developer documentation

## Supporting python keywords

## The getDocumenScroll problem in chromium/macOS

See test_getDocumenScroll.html

## Exclude file from linting

While trying to require blockly related javascript files, there were so many errors and warnings due to eslint that I had to disable this adding lines to .eslintigonre.

## Managing blockly and closure libraries

The closure compiler is used to create a single file containing blockly, edython and the require closure-library components.

## Working with submodule

Actually, submodules are configured for blockly, goog-closure and xregexp.
We see the configuration for the latter.

```
cd .../src/lib
git submodule add https://github.com/slevithan/xregexp
```

# edython Brick design

edython brick design is independant from Blockly's,
but may use Blockly's features or ideas internally

## General overview

Brick are visual objects which shape defines the behaviour.
There are many kinds of bricks, but we can gather them within 2 families : expression bricks and statement bricks.
Both follow the python convention as described in the documentation:

https://docs.python.org/3/reference/expressions.html

https://docs.python.org/3/reference/simple_stmts.html

https://docs.python.org/3/reference/compound_stmts.html

It was a choice not to follow the grammar description because names are more cryptic there.

There is not a one to one correspondance between the documentation above and the bricks. In general, statements are described quite exactly by bricks, but expressions have sometimes been split due to code reuse. For example, target_list is an edython brick, it is part of different expressions but it is not a python expression on its own.

## Brick differentiation

Bricks are different because their data model is different or because their behaviour is different. For that reason, brick implementation cannot follow a strict tree class model.

## Brick implementation

edython bricks are Blockly's BlockSvg subclasses.
They basically use the same input and connection design.
But extension was made to override Blocly's original behaviour. A delegation design is used to store additional methods and to store additional data.

## Brick creation

If the prototype name starts with 'eyo:' then the created brick is a subclass of BlockSvg with edython's extended features. If not, the creation process falls down to Blockly's.

For that purpose, some workspace methods have been overriden.

## Brick connections

Blockly connections are used for that purpose.

## Brick visual model

It is based on input/field model with additional fields for await and async python features.

## Brick data model

Each brick has an input model.
Expression bricks also have an output model whereas
statement bricks also have a statement model.

Both models are defined in the constructor.

### Input model

The input model gives the inputs and associated fields.
It is defined in the delegate creator.

## Brick delegation model

Every brick, even Blockly's, has a dedicated delegate.
The delegate stores both data specific to the brick and methods, which are not handled by Blockly (or handles differently). Different kinds of bricks may store the same methods. Shared code would take advantage of multiple inheritance. Instead, we consider using instead controllers.

Input and connections also have extensions.

In order to avoid name collisions, the object and the connection delegates are instance objects named `eyo`.
The input only stores data, its delegate is just a basic object named `edyData`.

Delegates follow a class hierarchy to manage some functionality of bricks. The roots are eyo.Delegate and eYo.DelegateSvg. Their children are eyo.Delegate.Expr for expressions and eyo.Delegate.Stmt for statements. Each prototype name corresponds to a delegate class.

All the eyo.Delegate.Expr subclasses share the same methods to draw their bricks, the same holds for eyo.Delegate.Stmt.subclasses. These methods are different for statement bricks and expressin bricks, but they may share some parts because the input model may be the same.
To allow code reuse between this to branches of the delagation class hieararchy, we rely on some controller design.

## Controller model

For tasks that may be shared between objects pertaining to different class branches, we define controllers.
Mixins could be used but it seems less dynamic and less easy at first glance.

We get both general controllers, that define behaviours shared by all the bricks, and specific ones, than can be subclassed. The main example being the xml controller which is reponsible of the persistent storage.

# Building

# Preparing

`npm run prepare`


## Building for a web application

`npm run build`