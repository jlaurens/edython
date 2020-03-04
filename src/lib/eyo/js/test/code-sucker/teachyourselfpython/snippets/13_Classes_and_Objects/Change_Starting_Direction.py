#note - an ERROR may be caused as Python is complaining about breaking out of the while loop when the window is closed - you can ignore that for now (or a fix is provied in the solutions section for those who are interested"""
"""
==========Task===============

"""

from tkinter import *
import random
import time

class Ball: 
    def __init__(self,canvas,color): 
        self.canvas=canvas 
        self.id=canvas.create_oval(30,30,50,50,fill=color) 
        self.canvas.move(self.id,100,200)

        #ADD THESE LINES TO OUR __INIT__ METHOD
        starting_position=[-3,-2,-1,1,2,3] #create a list with various possible starting positions
        random.shuffle(starting_position) #mix them up with the random shuffle function
        self.x = starting_position[0] #set the value of x to the first item in the list - this means x can be any value in the list from -3 to 3
        self.y = -3 #changing y to -3 will simply increase the rate at which it moves along y (increases the speed)
        self.canvas_height=self.canvas.winfo_height() #set the canvas height by calling the canvas function winfo_height (it gives us the current canvas height)

    def draw(self): 
        self.canvas.move(self.id,self.x,self.y) 
        pos=self.canvas.coords(self.id) 
        

        if pos[1] <=0: 
            self.y=1
        if pos[3] >=self.canvas_height: 
            self.y=-1
        

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




                    
