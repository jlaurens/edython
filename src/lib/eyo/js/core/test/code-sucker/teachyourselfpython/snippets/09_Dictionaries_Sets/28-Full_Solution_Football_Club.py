def main():
  mainmenu()


player_info= {} #create a dictionary that stores the player name: player goals
def mainmenu():

  
  
  
  

  while True:
          print("""=================MAIN MENU=======================
          1----Add players
          2----Search players(return average)
          3----Update Goals for players
          4----View All players
          5----Quit
  
  """)
          choice = int(input("Enter choice:"))
          if choice == 1:
              addplayers()
          elif choice == 2:
              searchplayer()
          elif choice == 3:
              update()
          elif choice == 4:
              viewall()
          elif choice == 5:
              sys.exit()
          else:
              print("You must make a valid choice - 1, 2 or 3")



def viewall():

    for keys, values in player_info.items():
        print(keys, values)
    print()

def update():
    playername=input("Which player's goals do you wish to update?:")
    m1=int(input("Match 1 new entry:"))
    m2=int(input("Match 2 new entry:"))
    m3=int(input("Match 3 new entry:"))
    if playername in player_info:
        #myDict["A"] = "Application"
        player_info[playername]="Boo"
        player_info[playername]={"Match 1 goals":m1,"Match 2 goals":m2,"Match 3 goals":m3}


def addplayers():
    
    
    num_players = int(input("Please enter number of players you wish to enter:"))
    print ("You are entering %s players" %num_players)
    player_data = ['Match 1 goals : ', 'Match 2 goals : ', 'Match 3 goals : ']
    for i in range(0,num_players):
        player_name = input("Enter Player Name :")
        player_info[player_name] = {}
        for entry in player_data:
            player_info[player_name][entry] = int(input(entry)) #storing the marks entered as integers to perform arithmetic operations later on.
        print()





def searchplayer():  
    print("===============SEARCH by player: Calculate average goals==================")
    if len(player_info.keys())==0:
        print("you have no players registered")
    else:
        name = input("Player name : ")
        while name not in player_info.keys():
            print("Please enter a valid player name:")
            name = input("Player name: ")
        #print student_info
        print ("Average player goals : ", str(sum(player_info[name].values())/3.0))

    print()

main()
                    
