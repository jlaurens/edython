"""
===========Task==============
1. Type this out for yourself to familiarise yourself with the setup
2. Change the variables/parameters and have a play around - e.g. Game title, background colour, etc

"""

from tkinter import *
import random
import time
tk=Tk() #creating a tk object
tk.title("My 21st Century Pong Game") #give the window a title, using the title function of the tk object
tk.resizable(0,0) #resizable makes the window a fixed size
tk.wm_attributes("-topmost",1) #the wm_attributes tell tkinter to place *this* window infront of all other windows
canvas=Canvas(tk,bg="red",width=500,height=400,bd=0,highlightthickness=0) #create canvas and create a few additional features, passing in parameters for border and thickness
canvas.pack() #tells the canvas to size itself according to the width and height parameters just given
tk.update() #update tells tkinter to initialise itself for the animation in the game to come - this last line is very important as otherwise things wouldn't quite work correctly!
                    
