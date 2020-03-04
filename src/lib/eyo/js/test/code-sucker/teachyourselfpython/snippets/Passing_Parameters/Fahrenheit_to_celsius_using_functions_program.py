#! /usr/bin/python
#-*-coding: utf-8 -*-
# calculates a given rectangle area

def hello():
    print('Hello!')
 
def area(width, height):
    return width * height
 
def print_welcome(name):
    print('Welcome,', name)
 
def positive_input(prompt):
    number = float(input(prompt))
    while number <= 0:
        print('Must be a positive number')
        number = float(input(prompt))
    return number
 
name = input('Your Name: ')
hello()
print_welcome(name)
print()
print('To find the area of a rectangle,')
print('enter the width and height below.')
print()
w = positive_input('Width: ')
h = positive_input('Height: ')
 
print('Width =', w, ' Height =', h, ' so Area =', area(w, h))
                    
