#Two lists -one with countries, and one with capital cities. Combine them into a Dictionary!

capital_cities=["London","Delhi","Washington D.C", "Cairo"]
countries=["United Kingdom", "India", "USA", "Egypt"]

#now we use a zip command to zip them together and create a dictionary

countries_with_capitals=zip(capital_cities,countries)

#countries_with_capitals is a variable that contains the "dictionary" in the 2-tuple list form.
#This can be transformed into a real dictionary using the function dict()

countries_with_capitals_dict=dict(countries_with_capitals)
print(countries_with_capitals_dict)


#What happens if one of the two lists has more values than the other?
#Answer...........the superfluous elements will simply not be used

                    
