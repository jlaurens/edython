Python 3.5.1 (v3.5.1:37a07cee5969, Dec  6 2015, 01:38:48) [MSC v.1900 32 bit (Intel)] on win32
Type "copyright", "credits" or "license()" for more information.
>>> teachers = {"Mr Moose": {"Computing"}, "Mr Donkey": {"Biology"}}
>>> for key in teachers:
	print(key)

	
Mr Moose
Mr Donkey
>>> #The above simply iterates over the keys of a dictionary. No method needed!
>>> #The method keys() can also be used to get the same result
>>> for key in teachers.keys():
	print(key)

	
Mr Moose
Mr Donkey
>>> 
                    
