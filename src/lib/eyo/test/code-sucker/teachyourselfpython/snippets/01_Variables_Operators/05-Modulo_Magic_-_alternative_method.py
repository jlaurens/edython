#Use of Modulo Arithmetic

def main():
  DAY="Monday"
  print("Here's a little modulo magic for ya...")
  dayofweek=input("Enter day of week (e.g. Monday, Tuesday, Wednesday, etc:")
  numberofdays=input("Enter number of days from that day of the week you would like to calculate:")
  
  if dayofweek=="Monday":
    dow=1 
  elif dayofweek=="Tuesday":
    dow=2 
  elif dayofweek=="Wednesday":
    dow=3 
  elif dayofweek=="Thursday":
    dow=4 
  elif dayofweek=="Friday":
    dow=5 
  elif dayofweek=="Saturday":
    dow=6 
  elif dayofweek=="Sunday":
    dow=7 
    
  modanswer=int(numberofdays)%7
  answer=modanswer+dow
  
  if answer==1:
    finalanswer="Monday"
  elif answer==2:
    finalanswer="Tuesday"
  elif answer==3:
    finalanswer="Wednesday"
  elif answer==4:
    finalanswer="Thursday"
  elif answer==5:
    finalanswer="Friday"
  elif answer==6:
    finalanswer="Saturday"
  elif answer==7:
    finalanswer="Sunday"
  
  print(numberofdays,"days from -",dayofweek,"-will be-",finalanswer)

main()
                    
