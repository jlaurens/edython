# Edython's application

The application represents the topmost object, somehow the main application.
It contains a desk where bricks are displayed, python programs are executed and output is displayed.

The main task of the application is to connect the desk to the outer world.

# Overall objects

## Application

|Object| Owner |Job|
|---|---|---|
|Application|None|Main object|
|Motion|||
|Clipboard|||
|Audio|||

## Desk

|Object| Owner |Job|
|---|---|---|
|Desk|||
|Workspace|Desk||
|Terminal|Desk||
|Turtle|Desk||
|Screen|Desk||

## Workspace

|Object| Owner |Job|
|---|---|---|
|Workspace|Desk||
|Flyout|Workspace||
|Search|Flyout||
|Library|Flyout||
|Draft|Flyout||

## Board

|Object| Owner |Job|
|---|---|---|
|Board|||
|Trashcan|||
|Scroller|||
|Brick|||

## Brick

|Object| Owner |Job|
|---|---|---|
|Brick|Board| Basic python instructions and expressions |
|Slot|Brick|Placeholder for bricks inside bricks|
|Magnet|Brick|Connectors of bricks|
|Field|Brick|Text fields in bricks|
|Span|Brick|Measurement of the area used|
|Shape|Brick|Shape of bricks|

## Not yet used

|Object| Owner |Job|
|---|---|---|
|Document|||
|Window|||
|Factory|||

# DOM tree
The main object is the application

* Application
	* Desk
	    * Terminal
	    * Turtle
	    * Graphic
	    * Workspace
	    	* Board
	    		* Brick
	    		* Scroller
	    	* Flyout
	    		* Search(Section)
		    		* Toolbar
		    		* Board
	    		* Draft(Section)
		    		* Toolbar
		    		* Board
	    		* Library
		    		* Toolbar
		    		* Board
