#Strip characters from text

#**FUNCTION TO STRIP A STRING OF SPECIFIC CHARACTERS, aeiou in this case
def strip_chars(str, chars):
    return "".join(c for c in str if c not in chars)
    
strip_vowels=strip_chars("The quick brown fox jumps over the lazy dog.", "aeiou")
print("Vowels have been stripped:", strip_vowels)
print()
print()

#**STRIP A STRING OF ALL BLANK SPACES
mytext="                       I love learning to code in python             "
print("Original:", mytext)
strip_whitespace=mytext.replace(" ","")
print("Stripped of white space:", strip_whitespace)

print()
print()
#***STRIP STRING OF LEADING & TRAILING WHITE SPACES
mytext="            I love learning to code in python            "
stripped_text=mytext.strip()
print(stripped_text)

print()
print()
#STRIP all LEADING characters or white spaces LSTRIP()
password="xxxxxxxxxpasswordxxxxxxxxx"
strippedpassword=password.lstrip("x")
print(strippedpassword)

print()
print()
#STRIP all TRAILING (at the end) characters / white spaces RSTRIP()
password="xxxxxxxxxpasswordxxxxxxxxx"
strippedpassword=password.rstrip("x")
print(strippedpassword)


                    
