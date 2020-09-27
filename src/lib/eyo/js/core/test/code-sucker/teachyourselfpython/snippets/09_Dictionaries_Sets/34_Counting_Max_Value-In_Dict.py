#There are 5 films, each with their "likes" in a key-value dictionary
#Find the film with the most likes!


def main():
    dictFilms = { 
       'Film 1' : 23, 
       'Film 2' : 44, 
       'Film 3' : 98, 
       'Film 4' : 87, 
       'Film 5' : 92,   }


    a=max(dictFilms,key=dictFilms.get)
    print(a)
   

main()
                    
