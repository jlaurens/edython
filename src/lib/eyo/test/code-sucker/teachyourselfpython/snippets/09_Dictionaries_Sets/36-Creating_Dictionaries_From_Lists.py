Python 3.5.1 (v3.5.1:37a07cee5969, Dec  6 2015, 01:38:48) [MSC v.1900 32 bit (Intel)] on win32
Type "copyright", "credits" or "license()" for more information.
>>> >>> teachers=["Mr Moose", "Mr Donkey", "Miss Engaging", "Mr Sly"]
>>> habits=["ear itch", "nose twitch", "hair twirl", "Eye squint"]
>>> teachers_habits = list(zip(teachers, habits))
>>> print(teachers_habits)
[('Mr Moose', 'ear itch'), ('Mr Donkey', 'nose twitch'), ('Miss Engaging', 'hair twirl'), ('Mr Sly', 'Eye squint')]
>>> #the above combined list is still in list form but you can see the key value pairs and the ease with which this can be turned into a dictionary
>>> teachers_habits_dict=dict(teachers_habits)
>>> print(teachers_habits_dict)
{'Mr Donkey': 'nose twitch', 'Miss Engaging': 'hair twirl', 'Mr Moose': 'ear itch', 'Mr Sly': 'Eye squint'}
>>> #What happens if one of the two argument lists contains more elements than the other one?
>>> #Easy - superfluous elements, which can't be paired, are just ignored!
>>> teachers=["Mr Moose", "Mr Donkey", "Miss Engaging", "Mr Sly", "Mr Mysterious"]
>>> habits=["ear itch", "nose twitch", "hair twirl", "Eye squint"]
>>> teachers_habits=list(zip(teachers, habits))
>>> teachers_habits_dict=dict(teachers_habits)
>>> print(teachers_habits_dict)
{'Mr Donkey': 'nose twitch', 'Miss Engaging': 'hair twirl', 'Mr Moose': 'ear itch', 'Mr Sly': 'Eye squint'}
>>> #....Yes, and you are left to wonder what the irritating habit of Mr Mysterious is!
                    
