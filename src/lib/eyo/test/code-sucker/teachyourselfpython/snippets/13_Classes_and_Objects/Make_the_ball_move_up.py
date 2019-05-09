#note - an ERROR may be caused as Python is complaining about breaking out of the while loop when the window is closed - you can ignore that for now (or a fix is provied in the solutions section for those who are interested"""
"""
==========Task===============
1. Create a second ball (red)
2. Make it also move across the screen 
"""

from tkinter import *
import random
import time

class Ball: 
    def __init__(self,canvas,color): 
        self.canvas=canvas 
        self.id=canvas.create_oval(30,30,50,50,fill=color) 
        """ Note: x and y coordinates for top left corner and x and y coordinates for the bottom right corner, and finally the fill colour for the oval
        """
        self.canvas.move(self.id,100,200) 

    def draw(self): #to make the ball move
        self.canvas.move(self.id,0,-1) #pass it 3 parameters, the id of the oval, and 0 and -1
        #0 = don't move horizontally (a + no. would indicate movement along the horizontal axis)
        #-1=move 1 pixel up the screen (-y) - remember the computer coordinate system!


def main():
    tk=Tk()
    tk.title("My 21st Century Pong Game")
    tk.resizable(0,0)
    tk.wm_attributes("-topmost",1)
    canvas=Canvas(tk,bg="white",width=500,height=400,bd=0,highlightthickness=0)
    canvas.pack()
    tk.update()

    ball1=Ball(canvas,'green')
    while 1:
        tk.update()
        ball1.draw() #call the ball draw method here
        time.sleep(0.01)
main()




                    
