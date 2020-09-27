"""
==========Task===============
1. Create two more ball objects (ball2, and ball3) making them different colours and at different locations to ball1
HINT: In order to do this you need to
a) Put the line: self.canvas.move(self.id,0,0) #this moves the oval to the specified location in it's own method called "move"
b) The method must call the parameters 'self', 'x' and 'y' (x and y are the x and y positions)
c) When inside the move method simply use:   canvas.move(self.id,x,y)

2. Play around with the size and shape of the "ball" .....this is in the __init__ method
"""

from tkinter import *
import random
import time

class Ball: #create a ball class
    def __init__(self,canvas,color): #initiliased with the variables/attributes self, canvas, and color
        self.canvas=canvas #set the intiial values for the starting attributes
        self.id=canvas.create_oval(30,30,50,50,fill=color) #starting default values for the ball
        """ Note: x and y coordinates for top left corner and x and y coordinates for the bottom right corner, and finally the fill colour for the oval
        """
        self.canvas.move(self.id,0,0) #this moves the oval to the specified location

    def draw(self): #we have created the draw method but it doesn't do anything yet.
        pass 

tk=Tk()
tk.title("My 21st Century Pong Game")
tk.resizable(0,0)
tk.wm_attributes("-topmost",1)
canvas=Canvas(tk,bg="white",width=500,height=400,bd=0,highlightthickness=0)
canvas.pack()
tk.update()


ball1=Ball(canvas,'green') #here we are creating an object (green ball) of the class Ball

                    
