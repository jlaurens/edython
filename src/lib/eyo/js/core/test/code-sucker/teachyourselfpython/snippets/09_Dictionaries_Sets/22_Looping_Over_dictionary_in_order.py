python_words = {'list': 'A collection of values that are not connected, but have an order.',
                'dictionary': 'A collection of key-value pairs.',
                'function': 'A named set of instructions that defines a set of actions in Python.',
                }

for word in sorted(python_words.keys()):
    print("%s: %s" % (word.title(), python_words[word]))
                    
