Python 3.5.1 (v3.5.1:37a07cee5969, Dec  6 2015, 01:38:48) [MSC v.1900 32 bit (Intel)] on win32
Type "copyright", "credits" or "license()" for more information.
>>> #Create options for a character named SUPER POG
>>> super_pog = {'weapon': 'sword', 'transport': 'chariot', 'age': 2}
>>> #Display the dictionary
>>> super_pog
{'weapon': 'sword', 'transport': 'chariot', 'age': 2}
>>> #Display the transport method for super_pog
>>> super_pog['transport']
'chariot'
>>> #Display the age of super_pog
>>> super_pog['age']
2
>>> #check to see if the option weapon is in the dictionary super_pog
>>> 'weapon' in super_pog
True
>>> #Display all the KEYS in the dictionary
>>> super_pog.keys()
dict_keys(['weapon', 'transport', 'age'])
>>> #Update the transportation vehicle for super_pog from chariot to horse
>>> super_pog['transport'] = 'horse'
>>> super_pog
{'weapon': 'sword', 'transport': 'horse', 'age': 2}
>>> 
                    
