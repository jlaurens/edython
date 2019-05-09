import random
import time

def displayIntro():
    print('You die and find yourself at a mysterious bus stop,')
    print('You notice one colourful bus headed down the hill, and another second grim looking bus with only one or two people heading toward it....')
    print('You need to decide which bus to get on....')
    print('Bus 1 looks fun, but Bus 2 is ....intereting')
    print()

def choosebus():
    bus = ''
    while bus != '1' and bus != '2':
        print('Which bus will you go into? (1 or 2)')
        bus = input()

    return bus

def checkbus(chosenbus):
    print('You approach the bus...')
    time.sleep(2)
    print('It is dark and spooky...')
    time.sleep(2)
    print('A large creature jumps out in front of you! He opens his jaws and...')
    print()
    time.sleep(2)

    friendlybus = random.randint(1, 2)

    if chosenbus == str(friendlybus):
         print('Says: "Good choice! Nice to meet you -do come with me...."!')
    else:
         print('Gobbles you down in one bite!')

playAgain = 'yes'
while playAgain == 'yes' or playAgain == 'y':

    displayIntro()

    busNumber = choosebus()

    checkbus(busNumber)

    print('Do you want to play again? (yes or no)')
    playAgain = input()
                    
