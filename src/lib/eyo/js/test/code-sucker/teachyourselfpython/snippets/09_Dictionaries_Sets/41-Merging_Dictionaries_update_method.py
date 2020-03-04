Python 3.5.1 (v3.5.1:37a07cee5969, Dec  6 2015, 01:38:48) [MSC v.1900 32 bit (Intel)] on win32
Type "copyright", "credits" or "license()" for more information.
>>> >>> teachers = {"Mr Moose": {"Computing"}, "Mr Donkey": {"Biology"}}
>>> teachers2={"Miss Engaging": {"Art & Craft"}, "Mr Moose": {"Computing", "Maths"}}
>>> teachers.update(teachers2)
>>> teachers
{'Mr Moose': {'Maths', 'Computing'}, 'Mr Donkey': {'Biology'}, 'Miss Engaging': {'Art & Craft'}}
>>> 
                    
