import sys
"""SUPER EXTENSION: What if the player wanted to move on from there and continue up the matrix? Example: In the player's next roll they rolled 5.
This would put them in position 10, which is star_matrix[1][4]. Can you code a solution that would correctly allocate the player to its new position up the matrix
"""
"""****PSEUDOCODE AND PLANNING*********************
   First, we will need another variable to store the current position = 0
   -----------NOTE THE FOLLOWING -------------------
   
   if current position is greater than 5
   star_matrix[1] <-- the first index number will be 1
   elif currentposition is greater than 10
   star_matrix[2] <-- the first index number will be 2
   elif currentposition is greater than 15
   star_matrix[3] <-- the first index number will be 3
   elif current position is grearer than 20
   star_matrix[4] <-- the first index number will be 4
   
   AND
   
   we know that position 6 would be star_matrix[1][0] (That is position(6)  - 6= which gives us 0 (the second index number)
   -----------------------7 would be star_matrix[1][1] (That is position(7)  - 6 =  which gives us 1 
   -----------------------8 would be star_matrix[1][2]  and so on........
   -----------------------9 would be star_matrix[1][3]
   ----------------------10 would be star_matrix[1][4]
   ----------------------11 would be star_matrix[2][0] 
"""

#...........SOME OF THE CODE HAS BEEN STARTED FOR YOU 

#note this has to be declared outside a function so as to be a global accessible object
star_matrix = [["*","*","*","*","*"],["*","*","*","*","*"],["*","*","*","*","*"],["*","*","*","*","*"],["*","*","*","*","*"]]
global current_position
current_position=0


def main():
#1. Create a nested list (each list is a row on the matrix)
   matrix = [["1 ", "2 ", "3 ","4 ","5 "], ["6 ","7 ","8 ","9 ","10 "], [11,12,13,14,15],[16,17,18,19,20],[21,22,23,24,25]]
   #star_matrix = [["*","*","*","*","*"],["*","*","*","*","*"],["*","*","*","*","*"],["*","*","*","*","*"],["*","*","*","*","*"]]
   for i in matrix:
      print(i)

   player_name=input("Enter a letter that will be your player name:")
   print("Thank you:", player_name)  
   
   play(current_position,player_name)

def play(current_position,player_name):
   
   
   
   dice_roll=input("Please enter a number from 1 to 5:")
   current_position=current_position+int(dice_roll)
   print("Well done, ", player_name, "You are now in position:", current_position)
   
   
   
   move(dice_roll,player_name,current_position)
                   
def move(dice_roll,player_name,current_position):

   if current_position<5:
      star_matrix[0][int(dice_roll)]=player_name
    
   elif current_position>=5 and current_position<10:
      star_matrix[1][int(current_position)-5]=player_name
   elif current_position>=10 and current_position<15:
      star_matrix[2][int(current_position)-10]=player_name
   elif current_position>=15 and current_position<20:
      star_matrix[3][int(current_position)-15]=player_name
   elif current_position>20 and current_position<24:
      star_matrix[4][int(current_position)-20]=player_name
   elif current_position>=24:
      print("Game won")
      sys.exit()
      
   for i in star_matrix:
      print(i)
   play(current_position,player_name)
   
                   

main()

                    
