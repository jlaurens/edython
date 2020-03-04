""" =======TASK===========
1. Add additional attributes such as baths_needed, diaper_change
2. create an instance called baby2 and print the no.of.baths needed, as well as diaper_changes

"""


class Baby:
    #A generic baby
    #initialiser or constructor (although it is strictly not the constructor) - this initialises the instance variables of an object
    #It is the first code that is executed when a new instance of a class is created
    def __init__(self, weight,milk):
        #initialise the attributes
        self.weight=0
        self.milk=milk
        self.status="newborn"
        self.type="Generic"

        #to make any of these attributes private, add an _after the self. and before the attribute name e.g. self._weight

def main():
    #instantiate the class - create an instance of the class (an object)
    baby1=Baby(7,2)
    print("Baby Status:",baby1.status)
    print("Milk needs(ounces):",baby1.milk)
    


if __name__ == "__main__": #think of this as a good conventional for invoking the main method in Python
    main()
                    
