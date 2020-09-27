#This is effectively an if statement within an if statement, note the indentation!

#Create an nested if statement in python that tells you the user's grade based on their score

score = input("Enter score: ")
score = int(score)
if score >= 80:
    grade = 'A'
else:
    if score >= 70:
        grade = 'B'
    else:
        if score >= 55:
            grade = 'C'
        else:
            if score >= 50:
                grade = 'Pass'
            else:
                 grade = 'Fail'
print ("

Grade is: " + grade)                    
