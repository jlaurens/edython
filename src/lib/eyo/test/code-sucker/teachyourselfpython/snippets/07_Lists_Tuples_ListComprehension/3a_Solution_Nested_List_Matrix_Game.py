"""************TASK
1. Create a 5 by 5 matrix - containing 5 row and 5 columns
2. Change the numbers in the grid to stars = *
3. Create a function called "play", ask the user for a letter that will be their player_name, and to roll_dice (and enter a number from 1 to 5)
4. Create a final function called "move". In it, assign the letter (playername) to the position on the matrix that has been rolled.
5. For example, if 3 was input as dice_roll, then print the matrix with the playername(e.g. "P") in position 3.

Example:
Enter a letter for your player name: P
Enter a dice_roll (enter number from 1 to 5): 3

EXPECTED OUPTPUT
Well done P, you are now in position 3 on the matrix: 
* * * P *
* * * * *
* * * * *
* * * * *
* * * * *

SUPER EXTENSION: What if the player wanted to move on from there and continue up the matrix? Example: In the player's next roll they rolled 5.
This would put them in position 10, which is star_matrix[1][4]. Can you code a solution that would correctly allocate the player to its new position up the matrix

"""
#...........SOME OF THE CODE HAS BEEN STARTED FOR YOU 

#note this has to be declared outside a function so as to be a global accessible object
star_matrix = [["*","*","*","*","*"],["*","*","*","*","*"],["*","*","*","*","*"],["*","*","*","*","*"],["*","*","*","*","*"]]
   
def main():
#1. Create a nested list (each list is a row on the matrix)
   matrix = [["1 ", "2 ", "3 ","4 ","5 "], ["6 ","7 ","8 ","9 ","10 "], [11,12,13,14,15],[16,17,18,19,20],[21,22,23,24,25]]
   #star_matrix = [["*","*","*","*","*"],["*","*","*","*","*"],["*","*","*","*","*"],["*","*","*","*","*"],["*","*","*","*","*"]]
   for i in matrix:
      print(i)
   play()

def play():
   player_name=input("Enter a letter that will be your player name:")
   print("Thank you:", player_name)
   dice_roll=input("Please enter a number from 1 to 5:")
   print("Well done, ", player_name, "You are now in position:", dice_roll)
   move(dice_roll,player_name)
                   
def move(dice_roll,player_name):
   star_matrix[0][int(dice_roll)]=player_name
   for i in star_matrix:
      print(i)
                   

main()

                    
