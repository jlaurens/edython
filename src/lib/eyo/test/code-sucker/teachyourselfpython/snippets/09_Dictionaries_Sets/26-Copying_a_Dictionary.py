Python 3.5.1 (v3.5.1:37a07cee5969, Dec  6 2015, 01:38:48) [MSC v.1900 32 bit (Intel)] on win32
Type "copyright", "credits" or "license()" for more information.
>>> Subjects = { "Computing":{"Mr Moose":"Room 16", 
                         "Unusual feature":"Large Nostrils", 
                         "Course name":"Having fun with Python"},
              "Biology":{"Mr Donkey":"Room 42",
                         "Unusual feature":"Hairy Ears",
                         "Course name":"The anatomy of a snake: Python"},
              "Quantum Computing":{"Mr Brain":"Room 82",
                         "Unusual feature":"Large frontal lobe",
                         "Course name":"Finding the meaning of life"}
              }
>>> #Create a new Dictionary called Subjects 2 (and copy Subjects)
>>> Subjects2=Subjects.copy()
>>> #Update Subjects and then Print Subject 2(test to see if it copies!)
>>> Subjects["Biology"]["Mr Donkey"] = "Room 99"
>>> print(Subjects2)
{'Biology': {'Mr Donkey': 'Room 99', 'Unusual feature': 'Hairy Ears', 'Course name': 'The anatomy of a snake: Python'}, 'Computing': {'Mr Moose': 'Room 16', 'Unusual feature': 'Large Nostrils', 'Course name': 'Having fun with Python'}, 'Quantum Computing': {'Unusual feature': 'Large frontal lobe', 'Course name': 'Finding the meaning of life', 'Mr Brain': 'Room 82'}}
>>> 
                    
