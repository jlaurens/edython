# This program stores information about students For each student,
#   we store the Rank, Top Subject, and whether Going to University is True or False

#You can see that the "value" part is a dictionary in itself. It is still useful to have a "key"
students = {'Joey': {'Rank': '1', 'TopSubject': 'Computing', 'University': True},
        'Bemi': {'Rank': '2', 'TopSubject': 'Maths', 'University': False},
        'Jodie': {'Rank': '3', 'TopSubject': 'Biology', 'University':True},
        }

# Print the Dictionary
for keys in students.items():
    print(keys)

                    
