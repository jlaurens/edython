#Challenge:
#See if you can add more questions, add a high score, grade or percentage to thsi program!


#------------------------------------------------
#written by www.teachingcomputing.com

#allow for a random 'key' in the dictionary to be accessed
import random

#the dictionary that contains the questions(which are the key) and the answers
my_dict =   {
                "The last book (about the end times) in the Bible?" : "Revelation",
                "Animal that starts with letter M and ends with E" : "Moose",
                "7-bit text encoding standard, starting with A" : "ascii",
                "16-bit text encoding standard, starting with U" : "unicode",
                "Name of the Lion in Narnia" : "Aslan",
                "8 bits make a..." : "byte",
                "1024 bytes make a..." : "kilobyte",
                "Picture Element. The smallest component of a bitmapped image" : "pixel",
                "What's at the end of life and the beginning of everything?" : "e",
                "First name of the chap who cretaed facebook" : "Mark",
                "Another word for loops beginning with I" : "Iteration"
            }

#Introductory message
print("Generally Bizarre Quiz")
print("=======================")

#When this variable is set to 'False', then this quiz will end!
playing = True

#While the game is running this variable is always 'True'
while playing == True:

    #Here we initialise the variable score: set the score to 0
    score = 0

    #gets the number of questions the player wants to answer
    num = int(input("
How many questions would you like: "))

    #loop the correct number of times
    for i in range(num):

        #the question is one of the dictionary keys, picked at random
        question = (random.choice( list(my_dict.keys())))
        #the answer is the string mapped to the question key
        answer = my_dict[question]

        #print the question, along with the question number
        print("
Question " + str(i+1) )
        print(question  + "?")

        #get the user's answer attempt
        guess = input("> ")

        #if their guess is the same as the answer
        if guess.lower() == answer.lower():
            #add 1 to the score and print a message
            print("Correct!")
            score += 1
        else:
            print("Nope!")

    #after the quiz, print their final score  
    print("
Your final score was " + str(score))

    #store the user's input...
    again = input("Enter any key to play again, or 'q' to quit.")

    #... and quit if they types 'q'
    if again.lower() == 'q':
        playing = False
                    
