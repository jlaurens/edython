python_words = {'list': 'A collection of values that are not connected, but have an order.',
                'dictionary': 'A collection of key-value pairs.',
                'function': 'A named set of instructions that defines a set of actions in Python.',
                }

def show_words(python_words):
    # A simple function to show the words in the dictionary.
    display_message = ""
    for word in python_words.keys():
        display_message += word + '  '
    print(display_message)

# Print each meaning, one at a time, and ask the user
#  what word they think it is.
for meaning in python_words.values():
    print("
%s" % meaning)

    # Assume the guess is not correct; keep guessing until correct.
    correct = False
    while not correct:
        
        print("
What word do you think this is?")
        show_words(python_words)
        guessed_word = input("- ")    
        
        # The guess is correct if the guessed word's meaning matches the current meaning.
        if python_words[guessed_word] == meaning:
            print("You got it!")
            correct = True
        else:
            print("Sorry, that's just not the right word.")
                    
