
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
        starting_position=[-3,-2,-1,1,2,3] 
        random.shuffle(starting_position) 
        self.x = starting_position[0] 
        self.y = -3 
        self.canvas_height=self.canvas.winfo_height()
        self.canvas_width=self.canvas.winfo_width() 

    def draw(self): 
        self.canvas.move(self.id,self.x,self.y) 
        pos=self.canvas.coords(self.id) 
        if pos[1] <=0: 
            self.y=6
        if pos[3] >=self.canvas_height: 
            self.y=-6
        if pos[0] <=0:
            self.x=6
        if pos[2]>=self.canvas_width:
            self.x=-6

#===CREATE A PONGBAT CLASS ===========
class Pongbat():
    def __init__(self,canvas,color): #called with the parameters self, canvas and color
        self.canvas=canvas
        self.id=canvas.create_rectangle(0,0,100,10,fill=color) #this creates the rectangle that will be the bat
        self.canvas.move(self.id,200,300) #initial 'movement' specified here

    def draw(self): #the paddle's draw function - nothing in here at the moment
        pass
        

def main():
    tk=Tk()
    tk.title("My 21st Century Pong Game")
    tk.resizable(0,0)
    tk.wm_attributes("-topmost",1)
    canvas=Canvas(tk,bg="white",width=500,height=400,bd=0,highlightthickness=0)
    canvas.pack()
    tk.update()

    ball1=Ball(canvas,'green')
    bat1=Pongbat(canvas,'red') #create an instance of the Pongbat class, called bat 1 = make the bat a brilliant red!
    while 1:
        tk.update()
        ball1.draw()
        bat1.draw() #call the bat's draw function 
        time.sleep(0.02) 
main()


#note - an ERROR may be caused as Python is complaining about breaking out of the while loop when the window is closed - you can ignore that for now (or a fix is provied in the solutions section for those who are interested"""

                    
