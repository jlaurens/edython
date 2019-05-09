#NOTE: don't worry for now about the error that arises on closing the window
"""
==========Task===============
Type this out at the end of your program.
A main loop is basically the central part of your program that controls what the program does!
If you call the program from outside of IDLE, it will appear for a second and then disappear
To stop this from happening....we create in our main loop a little code, that tells tkinter to redraw the screen
.....the loop keeps running forever - until we close the window.
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


def main(): #this main part is the central part of the program that generally controls most of what it will do .....
    tk=Tk()
    tk.title("My 21st Century Pong Game")
    tk.resizable(0,0)
    tk.wm_attributes("-topmost",1)
    canvas=Canvas(tk,bg="white",width=500,height=400,bd=0,highlightthickness=0)
    canvas.pack()
    tk.update()

    ball1=Ball(canvas,'green') #here we are creating an object (green ball) of the class Ball
    while 1:
        tk.update()
        ball1.draw() #call the ball draw method here
        time.sleep(0.01)
   
main()

                    
