#************TASK
#ask the user to enter four names of players one after the other, and store it in a list called "players"
#create a list of four different weapons and store it in a list called "weapons"
#assign each player a weapon, by looping over both lists simulatenously. e.g Player 1: Sword; Player 2: Arrows
#Print the result

#1. Create an empty list
players=[]
#2. Create a list of 4 weapons
weapons=["SWORD","BELT OF TRUTH", "ARMOUR", "SHEILD OF FAITH"]

#2  Create the main sub
def main():
   #ask for the name of player 1
   player1=input("Enter name of Player 1:")
   #append the name of player 1 to the list of players
   players.append(player1)
   #ask for the name of player 2
   player2=input("Enter name of Player 2:")
   #append the name of player 2 to the list of players
   players.append(player2)
   player3=input("Enter name of Player 3:")
   players.append(player3)
   player4=input("Enter name of Player 4:")
   players.append(player4)

   #print the list of players that have been entered
   print("The four players are:", players)

   #assign each player a weapon and print the result(loop over both lists)
   for (x,y) in zip(players,weapons):
      print(x, "has been assigned the:",y)
   

   


   
main()

                    
