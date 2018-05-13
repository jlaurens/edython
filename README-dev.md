# Developer documentation

## Supporting python keywords

## The getDocumenScroll problem in chromium/macOS

See test_getDocumenScroll.html

## Exlude file from linting

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

# edython Block design

edython block design is independant from Blockly's,
but uses Blockly's features internally

## General overview

Block are visual objects which shape defines the behaviour.
There are many kinds of blocks, but we can gather them within 2 families : expression blocks and statement blocks.
Both follow the python convention as described in the documentation:

https://docs.python.org/3/reference/expressions.html

https://docs.python.org/3/reference/simple_stmts.html

https://docs.python.org/3/reference/compound_stmts.html

It was a choice not to follow the grammar description because names are more cryptic there.

There is not a one to one correspondance between the documentation above and the blocks. In general, statements are described quite exactly by blocks, but expressions have sometimes been split due to code reuse. For example, target_list is an edython block, it is part of different expressions but it is not a python expression on its own.

## Block differentiation

Blocks are different because their data model is different or because their behaviour is different. For that reason, block implementation cannot follow a strict tree class model.

## Block implementation

edython blocks are Blockly's BlockSvg subclasses.
They basically use the same input and connection design.
But extension was made to override Blocly's original behaviour. A delegation design is used to store additional methods and to store additional data.

## Block creation

If the prototype name starts with 'edy:' then the created block is a subclass of BlockSvg with edython's extended features. If not, the creation process falls down to Blockly's.

For that purpose, some workspace methods have been overriden.

## Block connections

Blockly connections are used for that purpose.

## Block visual model

It is based on input/field model with additional fields for await and async python features.

## Block data model

Each block has an input model.
Expression blocks also have an output model whereas
statement blocks also have a statement model.

Both models are defined in the constructor.

### Input model

The input model gives the inputs and associated fields.
It is defined in the delegate creator.

## Block delegation model

Every block, even Blockly's, has a dedicated delegate.
The delegate stores both data specific to the block and methods, which are not handled by Blockly (or handles differently). Different kinds of blocks may store the same methods. Shared code would take advantage of multiple inheritance. Instead, we consider using instead controllers.

Input and connections also have extensions.

In order to avoid name collisions, the object and the connection delegates are instance objects named `edy`.
The input only stores data, its delegate is just a basic object named `edyData`.

Delegates follow a class hierarchy to manage some functionality of blocks. The roots are edy.Delegate and edY.DelegateSvg. Their children are edy.Delegate.Expr for expressions and edy.Delegate.Stmt for statements. Each prototype name corresponds to a delegate class.

All the edy.Delegate.Expr subclasses share the same methods to draw their blocks, the same holds for edy.Delegate.Stmt.subclasses. These methods are different for statement blocks and expressin blocks, but they may share some parts because the input model may be the same.
To allow code reuse between this to branches of the delagation class hieararchy, we rely on some controller design.

## Controller model

For tasks that may be shared between objects pertaining to different class branches, we define controllers.
Mixins could be used but it seems less dynamic and less easy at first glance.

We get both general controllers, that define behaviours shared by all the blocks, and specific ones, than can be subclassed. The main example being the xml controller which is reponsible of the persistent storage.
