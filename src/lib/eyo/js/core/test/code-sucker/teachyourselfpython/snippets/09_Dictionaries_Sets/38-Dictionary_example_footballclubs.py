Python 3.5.1 (v3.5.1:37a07cee5969, Dec  6 2015, 01:38:48) [MSC v.1900 32 bit (Intel)] on win32
Type "copyright", "credits" or "license()" for more information.
>>> #Create a dictionary, mapping football clubs to their nicknames
>>> footballclubs = {
	'Crystal Palace': 'Eagles',
	'Mancheter United': 'Red Devils',
	'Arsenal': 'The Gunners',
	'Chelsea': 'The Blues',
	'Southampton': 'The Saints'
	}
>>> footballclubs
{'Crystal Palace': 'Eagles', 'Southampton': 'The Saints', 'Chelsea': 'The Blues', 'Arsenal': 'The Gunners', 'Mancheter United': 'Red Devils'}
>>> #Find out the nickname (from the dictionary) of Chelsea
>>> footballclubs['Chelsea']
'The Blues'
>>> #Display all the KEYS in the dictionary (note: Keys, not values)
>>> footballclubs.keys()
dict_keys(['Crystal Palace', 'Southampton', 'Chelsea', 'Arsenal', 'Mancheter United'])
>>> #Update the nickname of Southampton to something else ...
>>> footballclubs[southampton] = 'The Unsaintly'
Traceback (most recent call last):
  File "<pyshell#8>", line 1, in <module>
    footballclubs[southampton] = 'The Unsaintly'
NameError: name 'southampton' is not defined
>>> #Note the case sensitivity above:
>>> 
                    
