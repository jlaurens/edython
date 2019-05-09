#There are 4 test groups that all do an exam.
#You want to find out all the groups that had more than 1 occurence of the score: 90
#90 being the highest you can score on this test!


def main():
    dictFilms = { 
       'Group 1' : (90, 90),
       'Group 2' : (44, 45),
       'Group 3' : (47, 90),
       'Group 4' : (90, 90),
       'Group 5' : (25, 23)  }


    my_list=[]
    for key in dictFilms:
        if dictFilms[key].count(90)>1:
            my_list.append(key)

    print("The group(s) that have more than 1 occurence of a 90 score are:", my_list)
   

main()
                    
