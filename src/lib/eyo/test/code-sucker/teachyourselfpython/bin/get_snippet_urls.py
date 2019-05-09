import urllib.request

def source_of_url(url, decoding = "utf8"):
    page = urllib.request.urlopen(url).read()
    page = page.decode(decoding)  # this may not be utf8
    return page

# page = source_of_url("https://teachyourselfpython.com")

page = """
<html lang="en"><head>
<link href="http://cdnjs.cloudflare.com/ajax/libs/prettify/r298/prettify.css" rel="stylesheet" type="text/css">
<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">

    <title>Coding: Code Snippets</title>

    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="python code snippets projects ideas python ">
    <meta name="keywords" content="">
    <meta name="author" content="">

    <!-- Bootstrap Css -->
    <link href="bootstrap-assets/css/bootstrap.min.css" rel="stylesheet">

    <link href="css/prism.css" rel="stylesheet">

    <!-- Style -->
    <link href="plugins/owl-carousel/owl.carousel.css" rel="stylesheet">
    <link href="plugins/owl-carousel/owl.theme.css" rel="stylesheet">
    <link href="plugins/owl-carousel/owl.transitions.css" rel="stylesheet">
    <link href="plugins/Lightbox/dist/css/lightbox.css" rel="stylesheet">
    <link href="plugins/Icons/et-line-font/style.css" rel="stylesheet">
    <link href="plugins/animate.css/animate.css" rel="stylesheet">
    <link href="css/main.css" rel="stylesheet">
    <link href="css/custom.css" rel="stylesheet">
    <link rel="stylesheet" href="css/expanding-list.css" type="text/css" media="screen, projection">
    <script src="https://www.googletagservices.com/activeview/js/current/osd.js?cb=%2Fr20100101"></script><script src="https://pagead2.googlesyndication.com/pub-config/r20160913/ca-pub-9043920153844099.js"></script><script src="https://pagead2.googlesyndication.com/pagead/js/r20190429/r20190131/show_ads_impl.js" id="google_shimpl"></script><script async="" src="https://www.google-analytics.com/analytics.js"></script><script type="text/javascript" src="js/expanding-list.js"></script>
    <!-- Icons Font -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">
    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->

    

<link rel="preload" href="https://adservice.google.fr/adsid/integrator.js?domain=teachyourselfpython.com" as="script"><script type="text/javascript" src="https://adservice.google.fr/adsid/integrator.js?domain=teachyourselfpython.com"></script><link rel="preload" href="https://adservice.google.com/adsid/integrator.js?domain=teachyourselfpython.com" as="script"><script type="text/javascript" src="https://adservice.google.com/adsid/integrator.js?domain=teachyourselfpython.com"></script><link rel="preload" href="https://pagead2.googlesyndication.com/pagead/js/r20190429/r20190131/show_ads_impl.js" as="script"><script type="text/javascript" charset="UTF-8" src="https://maps.googleapis.com/maps-api-v3/api/js/36/12/intl/fr_ALL/common.js"></script><script type="text/javascript" charset="UTF-8" src="https://maps.googleapis.com/maps-api-v3/api/js/36/12/intl/fr_ALL/util.js"></script></head>

<body>
    <!-- Preloader
	============================================= -->
    <!-- Header
	============================================= -->
    <section class="main-header">
        <nav class="navbar navbar-default navbar-fixed-top">
            
<style>

}

li.dropdown {
    display: inline-block;
}

.dropdown-content {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
}

.dropdown-content a {
    color: black;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
    text-align: left;
}

.dropdown-content a:hover {background-color: #f1f1f1}

.show {display:block;}

</style>

            <div class="container">
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <a class="navbar-brand" href="index.php"><h4 style="color:white;">
                    
                                        <img src="img/logos/typlogo.png" alt="Logo" style="width:45px;height:40px;">
                    
                                        <font color="white">TYP</font>
                    
                    
                    
                    </h4></a>
                </div>
                
                                
                <!--++++++++++++++Desktop/computer links here++++++++++++++++-->
                
                <div class="collapse navbar-collapse text-center" id="bs-example-navbar-collapse-1">
                    <div class="col-md-12 nav-wrap">
                        <ul class="nav navbar-nav">
                        
                                                     
                            
                            <li class="dropdown">
                                <a href="javascript:void(0)" class="dropbtn" onclick="myFunction()">Resources</a>
                                <div class="dropdown-content" id="myDropdown">
                                  <a href="index.php#welcome" class="page-scroll">Overview</a>
                                  <a href="http://www.teachyourselfpython.com/lesson.php?s=1_Mastering_Python_Series_Intro&amp;l=1_Intro_Python_Variables_CodeaChatbot_AI_more" class="page-scroll">Lessons</a>
                                  <a href="courses.php" class="page-scroll">Courses</a>
                                  <a href="http://www.teachyourselfpython.com/challenges.php" class="page-scroll">Challenges &amp; Tutorials</a>
                                  <a href="code-snippet.php" class="page-scroll">Code Snippet Library</a>
                                  
                                  
                                 
                                  
                                </div>
                            </li>
                            
                            
                              
                           
                            
                            
                             <li class="dropdown5">
                                <a href="javascript:void(0)" class="dropbtn" onclick="myFunction5()">Lessons</a>
                                <div class="dropdown-content" id="myDropdown5">
                                  <a href="what-you-get.php" class="page-scroll">What's on offer</a>
                                  <a href="lesson.php?s=1_Mastering_Python_Series_Intro&amp;l=1_Intro_Python_Variables_CodeaChatbot_AI_more" class="page-scroll">All Lessons</a>
                                 
                                  
                                </div>
                            </li>
                           
                           
                            
                            
                            
                            
                            
                            

                          
                            
                            <li><a href="index.php#contact" class="page-scroll">Contact</a></li>


                                                            <li><a href="login.php" class="page-scroll">Login</a></li>
                                <li><a href="signup.php" class="page-scroll">Signup</a></li>
                                                    </ul>
                    </div>
                </div>
                
                                
                
            </div>

            <script>
/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

function myFunction2() {
    document.getElementById("myDropdown2").classList.toggle("show");
}

function myFunction3() {
    document.getElementById("myDropdown3").classList.toggle("show");
}

function myFunction4() {
    document.getElementById("myDropdown4").classList.toggle("show");
}

function myFunction5() {
    document.getElementById("myDropdown5").classList.toggle("show");
}

function myFunction6() {
    document.getElementById("myDropdown6").classList.toggle("show");
}



// Close the dropdown if the user clicks outside of it
window.onclick = function(e) {
  if (!e.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var d = 0; d < dropdowns.length; d++) {
      var openDropdown = dropdowns[d];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}
</script>        </nav>
    </section>

    <!-- Main
	============================================= -->
    <section id="welcome">
        <div class="container-fluid">
            <div class="row">
                <p><br><br><br></p>
            </div>

            <div class="row">
                <div class="col-lg-2 text-left">
                    <div class="vertical-line">
                        


<div class="panel-group">
	<div class="panel panel-default">
		<div class="panel-heading">
			<h4 class="panel-title">
				<a href="code-snippet.php">Welcome</a>
			</h4>
		</div>
	</div>
</div>




        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#00_Intro_user_input_print">00 Intro user input print</a>
      </h4>
    </div>
    <div id="00_Intro_user_input_print" class="panel-collapse collapse ">
      <ul class="list-group">


                      <li class="list-group-item"><a href="show-code.php?t=00_Intro_user_input_print&amp;s=01-Print text to screen.py">01-Print text to screen.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=00_Intro_user_input_print&amp;s=02-Get User Input as String.py">02-Get User Input as String.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=00_Intro_user_input_print&amp;s=03-Get User Input as Integer.py">03-Get User Input as Integer.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=00_Intro_user_input_print&amp;s=04_How to set things up in a function.py">04 How to set things up in a function.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=00_Intro_user_input_print&amp;s=05-Chatbot task beginning.py">05-Chatbot task beginning.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=00_Intro_user_input_print&amp;s=06-Use of Variables and defining input.py">06-Use of Variables and defining input.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=00_Intro_user_input_print&amp;s=07-Take user input as variable and print.py">07-Take user input as variable and print.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=00_Intro_user_input_print&amp;s=08-Allow a new line to be printed.py">08-Allow a new line to be printed.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=00_Intro_user_input_print&amp;s=09-Use of Prompt to take user input.py">09-Use of Prompt to take user input.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=00_Intro_user_input_print&amp;s=10-Print a single star.py">10-Print a single star.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=00_Intro_user_input_print&amp;s=11-Printing to different lines or same line.py.py">11-Printing to different lines or same line.py.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=00_Intro_user_input_print&amp;s=12_Neat_formatting_string_output.py">12 Neat formatting string output.py</a></li>


        
      </ul>
    </div>
  </div>
</div>


        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#01_Variables_Operators">01 Variables Operators</a>
      </h4>
    </div>
    <div id="01_Variables_Operators" class="panel-collapse collapse ">
      <ul class="list-group">


                      <li class="list-group-item"><a href="show-code.php?t=01_Variables_Operators&amp;s=01 -Use of Variables in a simple chatbot.py">01 -Use of Variables in a simple chatbot.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=01_Variables_Operators&amp;s=02-Convert to Integer - alternative method.py">02-Convert to Integer - alternative method.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=01_Variables_Operators&amp;s=03-Use of Modulo Operator %.py">03-Use of Modulo Operator %.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=01_Variables_Operators&amp;s=04-Convert to Float.py">04-Convert to Float.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=01_Variables_Operators&amp;s=05-Modulo Magic - alternative method.py">05-Modulo Magic - alternative method.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=01_Variables_Operators&amp;s=06-Operators example 1.py">06-Operators example 1.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=01_Variables_Operators&amp;s=07-Operators example 2.py">07-Operators example 2.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=01_Variables_Operators&amp;s=08-Operators example 3.py">08-Operators example 3.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=01_Variables_Operators&amp;s=09-Use of Boolean Variables.py">09-Use of Boolean Variables.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=01_Variables_Operators&amp;s=10-Trying to add a string and integer.py">10-Trying to add a string and integer.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=01_Variables_Operators&amp;s=11-Rounding up floating point numbers.py">11-Rounding up floating point numbers.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=01_Variables_Operators&amp;s=12-Rounds a decimal to two places.py">12-Rounds a decimal to two places.py</a></li>


        
      </ul>
    </div>
  </div>
</div>


        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#02_If_Elif_Else_Selection">02 If Elif Else Selection</a>
      </h4>
    </div>
    <div id="02_If_Elif_Else_Selection" class="panel-collapse collapse ">
      <ul class="list-group">


                      <li class="list-group-item"><a href="show-code.php?t=02_If_Elif_Else_Selection&amp;s=01-Use of the if else statement.py">01-Use of the if else statement.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=02_If_Elif_Else_Selection&amp;s=02-Use of if and else using boolean expressions.py">02-Use of if and else using boolean expressions.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=02_If_Elif_Else_Selection&amp;s=03-Use of if and elif example.py">03-Use of if and elif example.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=02_If_Elif_Else_Selection&amp;s=04-Password checker solution.py">04-Password checker solution.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=02_If_Elif_Else_Selection&amp;s=05-Check for age with password checker.py">05-Check for age with password checker.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=02_If_Elif_Else_Selection&amp;s=06-Verify username and password.py">06-Verify username and password.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=02_If_Elif_Else_Selection&amp;s=07-A Nested IF ELSE example.py">07-A Nested IF ELSE example.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=02_If_Elif_Else_Selection&amp;s=08-Nested IF ELIF example.py">08-Nested IF ELIF example.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=02_If_Elif_Else_Selection&amp;s=09-Selection with and or built in.py">09-Selection with and or built in.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=02_If_Elif_Else_Selection&amp;s=10-Selection without ifs demo of DeMorgan's Laws.py">10-Selection without ifs demo of DeMorgan's Laws.py</a></li>


        
      </ul>
    </div>
  </div>
</div>


        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#03_While_Loops">03 While Loops</a>
      </h4>
    </div>
    <div id="03_While_Loops" class="panel-collapse collapse ">
      <ul class="list-group">


                      <li class="list-group-item"><a href="show-code.php?t=03_While_Loops&amp;s=00_While Loop Introduction.py">00 While Loop Introduction.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=03_While_Loops&amp;s=01-While_Loop_Simple_Example.py">01-While Loop Simple Example.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=03_While_Loops&amp;s=02-Demo_while_loop_for_loop_do_the_same_thing_timestableapp.py">02-Demo while loop for loop do the same thing timestableapp.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=03_While_Loops&amp;s=03-Username and password checker using loops.py">03-Username and password checker using loops.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=03_While_Loops&amp;s=04-Validation of password creation using loops.py">04-Validation of password creation using loops.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=03_While_Loops&amp;s=05-While Loops using Boolean Flags.py">05-While Loops using Boolean Flags.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=03_While_Loops&amp;s=06-While Loops with multiple statements.py">06-While Loops with multiple statements.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=03_While_Loops&amp;s=07-While Loop infinite loop.py">07-While Loop infinite loop.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=03_While_Loops&amp;s=08-Use of break to end an infinite while loop.py">08-Use of break to end an infinite while loop.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=03_While_Loops&amp;s=09-Use of continue statement in a while loop.py">09-Use of continue statement in a while loop.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=03_While_Loops&amp;s=10-Sentinel controlled while loop.py">10-Sentinel controlled while loop.py</a></li>


        
      </ul>
    </div>
  </div>
</div>


        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#04_For_Loops">04 For Loops</a>
      </h4>
    </div>
    <div id="04_For_Loops" class="panel-collapse collapse ">
      <ul class="list-group">


                      <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=01 - two lots of 10 stars.py">01 - two lots of 10 stars.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=02 - one line of 10 stars and one line of 10 planets.py">02 - one line of 10 stars and one line of 10 planets.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=03 - 10 x 10 matrix of stars.py">03 - 10 x 10 matrix of stars.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=04-matrix of stars_3x20.py">04-matrix of stars 3x20.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=05-matrix of planets_5 x 5.py">05-matrix of planets 5 x 5.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=06 -similar_planets_on_same_row.py">06 -similar planets on same row.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=07-similar_planets_on_same_column.py">07-similar planets on same column.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=08-Triangular Planetary Alignment.py">08-Triangular Planetary Alignment.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=09 - Solution for user defined box.py">09 - Solution for user defined box.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=10_For_Loop_Guess_the_Number.py">10 For Loop Guess the Number.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=11_Solution_User_input_ForLoop_Times_table.py">11 Solution User input ForLoop Times table.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=12- stars horizontal_use_of_default_end_statement.py">12- stars horizontal use of default end statement.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=13_For_Loop_password_challenge.py">13 For Loop password challenge.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=14-Break statement Example 1.py">14-Break statement Example 1.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=15-Break statement Example 2.py">15-Break statement Example 2.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=16-Creating a Running Total_initialisation.py">16-Creating a Running Total initialisation.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=17-Fibonacci_Sequence.py">17-Fibonacci Sequence.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=18-For_Loop_print_1_to_10_while_loop.py">18-For Loop print 1 to 10 while loop.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=19-For_Loop_with_a_list.py">19-For Loop with a list.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=20-ForLoop_Searching_a_dictionary.py">20-ForLoop Searching a dictionary.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=21-ForLoop_Searching_Phone_directory_Lists.py">21-ForLoop Searching Phone directory Lists.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=22-List, user input, For Loop Program.py">22-List, user input, For Loop Program.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=23-Loop_through_words_and_lists_for_loop.py">23-Loop through words and lists for loop.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=24-matrix of stars_20 x 20.py">24-matrix of stars 20 x 20.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=25-Nested Loop Example.py">25-Nested Loop Example.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=26-Nested Loop times table creator.py">26-Nested Loop times table creator.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=27-Nested Loops_running_totals_code.py">27-Nested Loops running totals code.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=28-Print 10 stars Vertical -default.py">28-Print 10 stars Vertical -default.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=04_For_Loops&amp;s=29-Three times table solution.py.py">29-Three times table solution.py.py</a></li>


        
      </ul>
    </div>
  </div>
</div>


        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#05_Local_Global_Variables">05 Local Global Variables</a>
      </h4>
    </div>
    <div id="05_Local_Global_Variables" class="panel-collapse collapse ">
      <ul class="list-group">


                      <li class="list-group-item"><a href="show-code.php?t=05_Local_Global_Variables&amp;s=01-Function_Local_global_total_variables.py">01-Function Local global total variables.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=05_Local_Global_Variables&amp;s=02-Two_functions_local_global_scope_example.py">02-Two functions local global scope example.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=05_Local_Global_Variables&amp;s=03-Score_Variable_incrementing.py">03-Score Variable incrementing.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=05_Local_Global_Variables&amp;s=04_Demonstrating the scope of a variable.py">04 Demonstrating the scope of a variable.py</a></li>


        
      </ul>
    </div>
  </div>
</div>


        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#06_Functions">06 Functions</a>
      </h4>
    </div>
    <div id="06_Functions" class="panel-collapse collapse ">
      <ul class="list-group">


                      <li class="list-group-item"><a href="show-code.php?t=06_Functions&amp;s=Fahrenheit_to_celsius_using_functions_program.py">Fahrenheit to celsius using functions program.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=06_Functions&amp;s=Find_Factorial_using_Function_return_feature.py">Find Factorial using Function return feature.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=06_Functions&amp;s=Find_area_of_rectangle_using_functions_inputPRompt.py">Find area of rectangle using functions inputPRompt.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=06_Functions&amp;s=Function_Local_global_total_variables.py">Function Local global total variables.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=06_Functions&amp;s=Function_multiple_parameter_passing.py">Function multiple parameter passing.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=06_Functions&amp;s=Function_pass_parameter_byRef.py">Function pass parameter byRef.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=06_Functions&amp;s=Function_string_parameter_passing.py">Function string parameter passing.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=06_Functions&amp;s=Functions_guess_password.py">Functions guess password.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=06_Functions&amp;s=Pass_name_numbers_functions_return_statement.py">Pass name numbers functions return statement.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=06_Functions&amp;s=Simple_Calculator_using_Functions.py">Simple Calculator using Functions.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=06_Functions&amp;s=Two_functions_local_global_scope_example.py">Two functions local global scope example.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=06_Functions&amp;s=afterlife_adventure_functions_loops_selection.py">afterlife adventure functions loops selection.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=06_Functions&amp;s=lots_of_functions.py">lots of functions.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=06_Functions&amp;s=with_function_username_and_password.py">with function username and password.py</a></li>


        
      </ul>
    </div>
  </div>
</div>


        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#07_Lists_Tuples_ListComprehension">07 Lists Tuples ListComprehension</a>
      </h4>
    </div>
    <div id="07_Lists_Tuples_ListComprehension" class="panel-collapse collapse ">
      <ul class="list-group">


                      <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=1-Intro_to_Lists.py">1-Intro to Lists.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=2-Personality_Predictor_app_lists.py">2-Personality Predictor app lists.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=3_List_of_people_given_assigned_weapon.py">3 List of people given assigned weapon.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=3a_Solution_Nested_List_Matrix_Game.py">3a Solution Nested List Matrix Game.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=3b_Solution_Extension_Nested_List_Matrix_Game.py">3b Solution Extension Nested List Matrix Game.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=3c_Product_search_create_basket.py">3c Product search create basket.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=Append_to_List_Example.py">Append to List Example.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=Contacts_New_Edit_Delete_Lists.py">Contacts New Edit Delete Lists.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=List of subjects and teachers_Search_by_Index.py">List of subjects and teachers Search by Index.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=List, user input, For Loop Program.py">List, user input, For Loop Program.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=List_timestable_solution.py">List timestable solution.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=List_using_Enumerate.py">List using Enumerate.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=Lists_ASCII_ListComphrension_vs_ForLoop.py">Lists ASCII ListComphrension vs ForLoop.py</a></li>


    

              <li class="list-group-item"><a href="../content/codesnippets_content/07_Lists_Tuples_ListComprehension/Lists_example_programs_creATE_these_PROGRAMS.pptx">Lists example programs creATE these PROGRAMS.pptx</a></li>
              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=Loop_thru_list_Subjects_search_return_Index.py">Loop thru list Subjects search return Index.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=Looping_through_list.py">Looping through list.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=Matrix_ListComphrension_UserInput_SolutiontoChallenge.py">Matrix ListComphrension UserInput SolutiontoChallenge.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=Modulo_Magic_using_Lists_give_day_numberofdays_return_Dayofweek.py">Modulo Magic using Lists give day numberofdays return Dayofweek.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=Mycontacts_slice_delete.py">Mycontacts slice delete.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=Random Generation from List.py">Random Generation from List.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=Random Generation from List_Random Numbers.py">Random Generation from List Random Numbers.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=Sack a teacher app_Remove_from_list_operation.py">Sack a teacher app Remove from list operation.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=Search_list_Return_IndexNo.py">Search list Return IndexNo.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=Sorting_List.py">Sorting List.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=Sorting_List_2_Numbers.py">Sorting List 2 Numbers.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=caesar_cipher_with_main_menu_decrypt_encrypt.py">caesar cipher with main menu decrypt encrypt.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=find_differences_in_list.py">find differences in list.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=generate_random_item_from_list.py">generate random item from list.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=loop_over_two_lists_simulatenously.py">loop over two lists simulatenously.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=07_Lists_Tuples_ListComprehension&amp;s=remove_duplicates_from_list.py">remove duplicates from list.py</a></li>


        
      </ul>
    </div>
  </div>
</div>


        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#08_String_Manipulation">08 String Manipulation</a>
      </h4>
    </div>
    <div id="08_String_Manipulation" class="panel-collapse collapse ">
      <ul class="list-group">


                      <li class="list-group-item"><a href="show-code.php?t=08_String_Manipulation&amp;s=Capitalising_first_letter.py">Capitalising first letter.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=08_String_Manipulation&amp;s=Check_for_upper_lower_case_in_strings.py">Check for upper lower case in strings.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=08_String_Manipulation&amp;s=Join_Strings_together_concatenate.py">Join Strings together concatenate.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=08_String_Manipulation&amp;s=Return_length_of_string.py">Return length of string.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=08_String_Manipulation&amp;s=String_formatting.py">String formatting.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=08_String_Manipulation&amp;s=Working_with_a_really_long_string.py">Working with a really long string.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=08_String_Manipulation&amp;s=convert_strings_to_upper_case_Lowercase.py">convert strings to upper case Lowercase.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=08_String_Manipulation&amp;s=find_certain_word_in_sentence.py">find certain word in sentence.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=08_String_Manipulation&amp;s=find_repeated_characters_in_string.py">find repeated characters in string.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=08_String_Manipulation&amp;s=is_String_decimal.py">is String decimal.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=08_String_Manipulation&amp;s=is_String_letters_numbers_only.py">is String letters numbers only.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=08_String_Manipulation&amp;s=login_using_file_handling_strip_split.py">login using file handling strip split.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=08_String_Manipulation&amp;s=see_if_string_starts_with_letter.py">see if string starts with letter.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=08_String_Manipulation&amp;s=splitting_a_word_on_white_spaces.py">splitting a word on white spaces.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=08_String_Manipulation&amp;s=string_manipulation_accessing.py">string manipulation accessing.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=08_String_Manipulation&amp;s=string_manipulation_updating.py">string manipulation updating.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=08_String_Manipulation&amp;s=strip_characters_or_blank_spaces_from_strings.py">strip characters or blank spaces from strings.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=08_String_Manipulation&amp;s=strip_split_join_csv_method_file_read.py">strip split join csv method file read.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=08_String_Manipulation&amp;s=thingswithstrings_formatting.py">thingswithstrings formatting.py</a></li>


        
      </ul>
    </div>
  </div>
</div>


        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#09_Dictionaries_Sets">09 Dictionaries Sets</a>
      </h4>
    </div>
    <div id="09_Dictionaries_Sets" class="panel-collapse collapse ">
      <ul class="list-group">


                      <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=01-Creating_a_Dictionary.py">01-Creating a Dictionary.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=02-Accessing_Values_in_Dictionary.py">02-Accessing Values in Dictionary.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=03-Adding_Values_to_Dictionary.py">03-Adding Values to Dictionary.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=04-Updating_Editing_Values_in_Dictionaries.py">04-Updating Editing Values in Dictionaries.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=05-Deleting_elements_entries_in_dictionary.py">05-Deleting elements entries in dictionary.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=06-Print_all_keys_in_dictionary.py">06-Print all keys in dictionary.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=07-Print_all_values_in_dictionary.py">07-Print all values in dictionary.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=08_Dictionaries_Intro_registration_feature.py">08 Dictionaries Intro registration feature.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=09-Dictionaries_course_teacher_finder.py">09-Dictionaries course teacher finder.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=10_Create_new_dict_from_given_keys.py">10 Create new dict from given keys.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=11-Print_keys_and_values_in_dictionary.py">11-Print keys and values in dictionary.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=12_Find_length_of_dictionary.py">12 Find length of dictionary.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=13-See_if_key_exists_in_dictionary_simple.py">13-See if key exists in dictionary simple.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=14_If_Key_does_not_exist.py">14 If Key does not exist.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=15-See_if_key_exists_in_dictionary.py">15-See if key exists in dictionary.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=16_Counting_values_in_a_Dictionary.py">16 Counting values in a Dictionary.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=17_Combine_two_lists_into_a_Dictionary].py">17 Combine two lists into a Dictionary].py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=18_Create_two_lists_from_a_Dictionary.py">18 Create two lists from a Dictionary.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=19_Create_nested_dictionary_many_values.py">19 Create nested dictionary many values.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=20_Nested_dictionary_nested_loops.py">20 Nested dictionary nested loops.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=21_Looping_over_Dictionary.py">21 Looping over Dictionary.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=22_Looping_Over_dictionary_in_order.py">22 Looping Over dictionary in order.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=23_Looping_User_Input_Dictionary_Full_Program.py">23 Looping User Input Dictionary Full Program.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=24 - Minecraft_Game_starter_Dictionaries.py">24 - Minecraft Game starter Dictionaries.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=25- Minecraft_Game_crafting_options_added.py">25- Minecraft Game crafting options added.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=26-Copying_a_Dictionary.py">26-Copying a Dictionary.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=27-Iterating_over_a_dictionary.py">27-Iterating over a dictionary.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=28-Full_Solution_Football_Club.py">28-Full Solution Football Club.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=29_Merging_two_dictionaries.py">29 Merging two dictionaries.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=30_add_multiple_values_from_list_to_dictionary.py">30 add multiple values from list to dictionary.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=31_Is_Dictionary_full_or_empty.py">31 Is Dictionary full or empty.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=32_Sorting_a_dictionary.py">32 Sorting a dictionary.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=33_Copy_a_dictionary.py">33 Copy a dictionary.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=34_Counting_Max_Value-In_Dict.py">34 Counting Max Value-In Dict.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=35-ForLoop_Searching_a_dictionary.py">35-ForLoop Searching a dictionary.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=36-Creating_Dictionaries_From_Lists.py">36-Creating Dictionaries From Lists.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=37-Dictionaries_simple_example_intro.py">37-Dictionaries simple example intro.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=38-Dictionary_example_footballclubs.py">38-Dictionary example footballclubs.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=39-Dictionary_examples_operations_super_pog.py">39-Dictionary examples operations super pog.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=40-Dictionary_inside_Dictionary_example.py">40-Dictionary inside Dictionary example.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=41-Merging Dictionaries_update_method.py">41-Merging Dictionaries update method.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=42-Minecraft_Game_starter_Dictionaries.py">42-Minecraft Game starter Dictionaries.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=43-Print_Dictionary_plain_and_simple.py">43-Print Dictionary plain and simple.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=44-Quiz feature using dictionaries.py">44-Quiz feature using dictionaries.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=45-Search_for_value_in_nested_dictionary_which_contains_multiple_values.py">45-Search for value in nested dictionary which contains multiple values.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=46-Write_a_dictionary_to_text_or_csv_file.py">46-Write a dictionary to text or csv file.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=47_Read_file_contents_into_dictionary_strip_split_using_regex.py">47 Read file contents into dictionary strip split using regex.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=48_Read_file_contents_into_dict_alternative.py">48 Read file contents into dict alternative.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=49_Find_mean_average_of_dictionary_values.py">49 Find mean average of dictionary values.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=09_Dictionaries_Sets&amp;s=50_login_with_username_password_using_dictionary_method.py">50 login with username password using dictionary method.py</a></li>


        
      </ul>
    </div>
  </div>
</div>


        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#10_File_Handling_Read_Write_Search_Edit">10 File Handling Read Write Search Edit</a>
      </h4>
    </div>
    <div id="10_File_Handling_Read_Write_Search_Edit" class="panel-collapse collapse ">
      <ul class="list-group">


                      <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=01-Open a file and read characters.py.py">01-Open a file and read characters.py.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=02-Check current pointer position in file.py.py">02-Check current pointer position in file.py.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=03_remove_white_spaces_and_newlines_when_reading_into_list.py">03 remove white spaces and newlines when reading into list.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=04-Read whole file contents in one go.py.py">04-Read whole file contents in one go.py.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=05-Read one character from file.py.py">05-Read one character from file.py.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=06-Read all characters one by one from file.py.py">06-Read all characters one by one from file.py.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=07-Read_all_characters_one_by_one_BETTER METHOD.py">07-Read all characters one by one BETTER METHOD.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=08-Reading_a_single_line_from_file.py">08-Reading a single line from file.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=09-Reading_several_lines_from_file.py">09-Reading several lines from file.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=10-Strip_newlines_whitespace_while_reading_in_file.py">10-Strip newlines whitespace while reading in file.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=11-Reading all lines at once.py.py">11-Reading all lines at once.py.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=12-Reading particular columns from file.py.py">12-Reading particular columns from file.py.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=13-Reading columns alternative method.py.py">13-Reading columns alternative method.py.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=14-Read_tell_seek_for_reading_file.py">14-Read tell seek for reading file.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=15_Search_in_list_return_value_with_error.py">15 Search in list return value with error.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=16_Search_in_list_return_value_with_error -Fixed(strip_lines_AND_spaces).py">16 Search in list return value with error -Fixed(strip lines AND spaces).py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=17-Re position the pointer at the start of file.py.py">17-Re position the pointer at the start of file.py.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=18_Search_for_field_return_next_column's_field.py">18 Search for field return next column's field.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=19_Search_using_CSV.py">19 Search using CSV.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=20_Search_using_CSV_not_found_feature_added.py">20 Search using CSV not found feature added.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=21-Add_Write_a_new_user_to_file_solution.py">21-Add Write a new user to file solution.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=22-Quiz Program Save scores to a text file.py.py">22-Quiz Program Save scores to a text file.py.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=23_Editing_a_record_based_on_field.py">23 Editing a record based on field.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=24-Deleting_a_record_based_on_user_specified_field.py">24-Deleting a record based on user specified field.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=25-Creating a copy of a file.py.py">25-Creating a copy of a file.py.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=26-Search for the existence of a file.py.py">26-Search for the existence of a file.py.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=27-Simple writing to a file.py">27-Simple writing to a file.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=28_Copy a file.py.py">28 Copy a file.py.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=10_File_Handling_Read_Write_Search_Edit&amp;s=29_Simple Append text to a file.py.py">29 Simple Append text to a file.py.py</a></li>


        
      </ul>
    </div>
  </div>
</div>


        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#11_Arrays">11 Arrays</a>
      </h4>
    </div>
    <div id="11_Arrays" class="panel-collapse collapse ">
      <ul class="list-group">


                
      </ul>
    </div>
  </div>
</div>


        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#12_Sorting_Methods">12 Sorting Methods</a>
      </h4>
    </div>
    <div id="12_Sorting_Methods" class="panel-collapse collapse ">
      <ul class="list-group">


                
      </ul>
    </div>
  </div>
</div>


        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#13_Classes_and_Objects">13 Classes and Objects</a>
      </h4>
    </div>
    <div id="13_Classes_and_Objects" class="panel-collapse collapse ">
      <ul class="list-group">


                      <li class="list-group-item"><a href="show-code.php?t=13_Classes_and_Objects&amp;s=Add_Pong_Bat_class.py">Add Pong Bat class.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=13_Classes_and_Objects&amp;s=Bat_Movement.py">Bat Movement.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=13_Classes_and_Objects&amp;s=Change_Starting_Direction.py">Change Starting Direction.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=13_Classes_and_Objects&amp;s=Class_Attributes.py">Class Attributes.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=13_Classes_and_Objects&amp;s=Class_Methods.py">Class Methods.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=13_Classes_and_Objects&amp;s=Create_a_Class.py">Create a Class.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=13_Classes_and_Objects&amp;s=Create_a_ball_class.py">Create a ball class.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=13_Classes_and_Objects&amp;s=Create_bouncing_ball_movement.py">Create bouncing ball movement.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=13_Classes_and_Objects&amp;s=Make_the_ball_move_up.py">Make the ball move up.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=13_Classes_and_Objects&amp;s=Right_left_screen_collision_detection.py">Right left screen collision detection.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=13_Classes_and_Objects&amp;s=Set_Up_Game_Canvas.py">Set Up Game Canvas.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=13_Classes_and_Objects&amp;s=Setup_main_animation_loop.py">Setup main animation loop.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=13_Classes_and_Objects&amp;s=bat_ball_collision_detection.py">bat ball collision detection.py</a></li>


        
      </ul>
    </div>
  </div>
</div>


        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#Full_Programs_step_by_Step">Full Programs step by Step</a>
      </h4>
    </div>
    <div id="Full_Programs_step_by_Step" class="panel-collapse collapse ">
      <ul class="list-group">


        
          <li class="list-group-item"><a href="code-snippet.php?t=Full_Programs_step_by_Step&amp;s=Creating_an_Arithmetic_Quiz">Creating an Arithmetic Quiz</a></li>

        
          <li class="list-group-item"><a href="code-snippet.php?t=Full_Programs_step_by_Step&amp;s=Form_Tutor_Management_System">Form Tutor Management System</a></li>

        
          <li class="list-group-item"><a href="code-snippet.php?t=Full_Programs_step_by_Step&amp;s=Netflix_type_System_demo">Netflix type System demo</a></li>

        
          <li class="list-group-item"><a href="code-snippet.php?t=Full_Programs_step_by_Step&amp;s=RollDice_Matrix_Game">RollDice Matrix Game</a></li>

                
      </ul>
    </div>
  </div>
</div>


        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#Incrementation_Examples">Incrementation Examples</a>
      </h4>
    </div>
    <div id="Incrementation_Examples" class="panel-collapse collapse ">
      <ul class="list-group">


                
      </ul>
    </div>
  </div>
</div>


        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#Main_Menu_examples">Main Menu examples</a>
      </h4>
    </div>
    <div id="Main_Menu_examples" class="panel-collapse collapse ">
      <ul class="list-group">


                
      </ul>
    </div>
  </div>
</div>


        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#Passing_Parameters">Passing Parameters</a>
      </h4>
    </div>
    <div id="Passing_Parameters" class="panel-collapse collapse ">
      <ul class="list-group">


                      <li class="list-group-item"><a href="show-code.php?t=Passing_Parameters&amp;s=Fahrenheit_to_celsius_using_functions_program.py">Fahrenheit to celsius using functions program.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Passing_Parameters&amp;s=Function_multiple_parameter_passing.py">Function multiple parameter passing.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Passing_Parameters&amp;s=Function_pass_parameter_byRef.py">Function pass parameter byRef.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Passing_Parameters&amp;s=Function_string_parameter_passing.py">Function string parameter passing.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Passing_Parameters&amp;s=Pass_name_numbers_functions_return_statement.py">Pass name numbers functions return statement.py</a></li>


        
      </ul>
    </div>
  </div>
</div>


        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#Program_Examples">Program Examples</a>
      </h4>
    </div>
    <div id="Program_Examples" class="panel-collapse collapse ">
      <ul class="list-group">


        
          <li class="list-group-item"><a href="code-snippet.php?t=Program_Examples&amp;s=Creating_an_Arithmetic_Quiz">Creating an Arithmetic Quiz</a></li>

                      <li class="list-group-item"><a href="show-code.php?t=Program_Examples&amp;s=Quiz Part 1_Create Variables_RandomQuestion_user_response.py">Quiz Part 1 Create Variables RandomQuestion user response.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Program_Examples&amp;s=Quiz Part 2_Check User's response_ask for user name.py">Quiz Part 2 Check User's response ask for user name.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Program_Examples&amp;s=Quiz Part 3_Validate User's name.py">Quiz Part 3 Validate User's name.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Program_Examples&amp;s=Quiz Part 4_Calculate_Score.py">Quiz Part 4 Calculate Score.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Program_Examples&amp;s=Quiz Part 5_Put_it_in_a_function.py">Quiz Part 5 Put it in a function.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Program_Examples&amp;s=Quiz Part 6_Save_scores_to_text_file.py">Quiz Part 6 Save scores to text file.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Program_Examples&amp;s=gameofLife_tkinter.py">gameofLife tkinter.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Program_Examples&amp;s=snake_game_tkinter.py">snake game tkinter.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Program_Examples&amp;s=webbrowser_tkinter.py">webbrowser tkinter.py</a></li>


        
      </ul>
    </div>
  </div>
</div>


        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#Pygame_Game_examples">Pygame Game examples</a>
      </h4>
    </div>
    <div id="Pygame_Game_examples" class="panel-collapse collapse ">
      <ul class="list-group">


                
      </ul>
    </div>
  </div>
</div>


        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#Python_and_SQLite">Python and SQLite</a>
      </h4>
    </div>
    <div id="Python_and_SQLite" class="panel-collapse collapse ">
      <ul class="list-group">


                      <li class="list-group-item"><a href="show-code.php?t=Python_and_SQLite&amp;s=1-Connect_to_database_Create_a_table.py">1-Connect to database Create a table.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Python_and_SQLite&amp;s=10_Count_rows.py">10 Count rows.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Python_and_SQLite&amp;s=11_Find_Max_Value.py">11 Find Max Value.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Python_and_SQLite&amp;s=12_Calculate_Average.py">12 Calculate Average.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Python_and_SQLite&amp;s=13_Calculate_SUM.py">13 Calculate SUM.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Python_and_SQLite&amp;s=14_Login_username_password.py">14 Login username password.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Python_and_SQLite&amp;s=2-Add_Records_to_table.py">2-Add Records to table.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Python_and_SQLite&amp;s=3_Fetch_and_display_records.py">3 Fetch and display records.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Python_and_SQLite&amp;s=4_Update_database_records.py">4 Update database records.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Python_and_SQLite&amp;s=5_Delete_Records.py">5 Delete Records.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Python_and_SQLite&amp;s=6_Search_by_condition_where_clause.py">6 Search by condition where clause.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Python_and_SQLite&amp;s=7_Search_for_key_phrase.py">7 Search for key phrase.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Python_and_SQLite&amp;s=8_Sorting_in_SQLite.py">8 Sorting in SQLite.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Python_and_SQLite&amp;s=9_Search_and_return_selected_fields.py">9 Search and return selected fields.py</a></li>


    

              <li class="list-group-item"><a href="../content/codesnippets_content/Python_and_SQLite/The Site for Data Sets.url">The Site for Data Sets.url</a></li>
        
      </ul>
    </div>
  </div>
</div>


        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#Randomness_Random_numbers">Randomness Random numbers</a>
      </h4>
    </div>
    <div id="Randomness_Random_numbers" class="panel-collapse collapse ">
      <ul class="list-group">


                
      </ul>
    </div>
  </div>
</div>


        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#Recursion">Recursion</a>
      </h4>
    </div>
    <div id="Recursion" class="panel-collapse collapse ">
      <ul class="list-group">


                      <li class="list-group-item"><a href="show-code.php?t=Recursion&amp;s=Python - Recursion_Mystery_Function_Calling_with_parameters.py">Python - Recursion Mystery Function Calling with parameters.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Recursion&amp;s=Python - Recursive Function example.py">Python - Recursive Function example.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Recursion&amp;s=Python - Recursive Function example_Final Solution.py">Python - Recursive Function example Final Solution.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Recursion&amp;s=Python - Recursive Function example_solution.py">Python - Recursive Function example solution.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Recursion&amp;s=Recursion.py">Recursion.py</a></li>


              <li class="list-group-item"><a href="show-code.php?t=Recursion&amp;s=Recursion2.py">Recursion2.py</a></li>


        
      </ul>
    </div>
  </div>
</div>


        
        
       
        
        

<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#Validation_examples">Validation examples</a>
      </h4>
    </div>
    <div id="Validation_examples" class="panel-collapse collapse ">
      <ul class="list-group">


                      <li class="list-group-item"><a href="show-code.php?t=Validation_examples&amp;s=Validation_password_creation_solution.py">Validation password creation solution.py</a></li>


        
      </ul>
    </div>
  </div>
</div>


                    </div>
                </div>

                <div class="col-lg-10">
                    <h2 class="section-heading" style="color:black;">Code Snippets</h2>
                    <hr>

                    <div style="text-align:left;">
                        
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>Python Code Snippets - Python Code examples</title>


<p>
<b>&lt;&lt;- Check out our python code snippet library</b><br>
If you're looking for a code snippet or python code example, you are likely to find it here! <br><br>
Python is a great programming language to learn when getting started. It's also a powerful language used by many companies for making and deploying web apps.&nbsp;<a href="http://blog.trinket.io/why-python" target="_blank">Learn more.</a>&nbsp;We hope you enjoy our comprehensive and growing range of lessons, tutorials and challenges that will take you from a complete beginner to a confident programmer. Do start with our popular and pedaogicially tried and tested "Solve and Learn" series and check out our lessons. The trinket based tutorials have been adapted, with permission, from hourofpython.com/. Trinket, if you're interested lets you run and write code in any browser, on any device.Trinkets work instantly, with no need to log in, download plugins, or install software. Easily share or embed the code with your changes when you're done. Pretty amazing!</p>

<p>

<span style="color:#00FF00;"><span style="background-color:#000000;"> </span></span><span style="color:#FFFFFF;"><strong><span style="background-color:#000000;">CODE</span></strong><span style="background-color:#000000;">&nbsp;</span><strong><span style="background-color:#000000;">SNIPPETS COLLECTION</span></strong></span><span style="background-color:#000000;">&nbsp;</span>&nbsp;- 
<br><br>

We aim to provide, in time, the largest useful collection of python code snippets on the web. Under Construction &gt;&gt;&nbsp;<span style="color:#00FF00;"><span style="background-color:#000000;"> </span></span><span style="color:#FFFFFF;"><strong><span style="background-color:#000000;">CODE</span></strong><span style="background-color:#000000;">&nbsp;</span><strong><span style="background-color:#000000;">SNIPPETS</span></strong></span><span style="background-color:#000000;">&nbsp;</span>







<br><br>
<iframe allowfullscreen="" frameborder="0" height="356" marginheight="0" marginwidth="0" src="https://trinket.io/embed/python/fbc95262d1" width="100%"></iframe></p>


<iframe src="https://rcm-eu.amazon-adsystem.com/e/cm?o=2&amp;p=48&amp;l=ur1&amp;category=consumerelectronics&amp;f=ifr&amp;linkID=8144935cc4fada845e1993cb6bd8b07e&amp;t=wwwteachingco-21&amp;tracking_id=wwwteachingco-21" width="1200" height="90" scrolling="no" border="0" marginwidth="0" style="border:none;" frameborder="0"></iframe>
<br>
<script async="" src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle" style="display: block; text-align: center; height: 200px;" data-ad-format="fluid" data-ad-layout="in-article" data-ad-client="ca-pub-9043920153844099" data-ad-slot="5721853099" data-adsbygoogle-status="done"><ins id="aswift_0_expand" style="display:inline-table;border:none;height:200px;margin:0;padding:0;position:relative;visibility:visible;width:1037px;background-color:transparent;"><ins id="aswift_0_anchor" style="display:block;border:none;height:200px;margin:0;padding:0;position:relative;visibility:visible;width:1037px;background-color:transparent;"><iframe width="1037" height="200" frameborder="0" marginwidth="0" marginheight="0" vspace="0" hspace="0" allowtransparency="true" scrolling="no" allowfullscreen="true" onload="var i=this.id,s=window.google_iframe_oncopy,H=s&amp;&amp;s.handlers,h=H&amp;&amp;H[i],w=this.contentWindow,d;try{d=w.document}catch(e){}if(h&amp;&amp;d&amp;&amp;(!d.body||!d.body.firstChild)){if(h.call){setTimeout(h,0)}else if(h.match){try{h=s.upd(h,i)}catch(e){}w.location.replace(h)}}" id="aswift_0" name="aswift_0" style="left:0;position:absolute;top:0;border:0px;width:1037px;height:200px;"></iframe></ins></ins></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>






<p></p>

<p></p>


                    </div>
                </div>
            
        </div>
    </div></section>

    
    
    <!-- Footer
	============================================= -->
    <footer>
        <div class="container">
	
	<div class="row">
            <div class="col-sm-4">
                <p><a href="about.php" style="color:white;">About</a></p>
                <p><a rel="nofollow" href="subscription-required.php" style="color:white;">Our resources</a></p>
                <p><a href="upcomingtutorials.php" style="color:white;">Upcoming Tutorials</a></p>
            </div>
            <div class="col-sm-4">
                <p><a rel="nofollow" href="https://www.facebook.com/TeachingComputing" style="color:white;">Facebook</a></p>
                <p><a rel="nofollow" href="http://www.teachingcomputing.com" target="_blank" style="color:white;">TeachingComputing.com</a></p>
            </div>
            <div class="col-sm-4">
                <p><a rel="nofollow" href="index.php#contact" style="color:white;">Contact</a></p>
                <p><a rel="nofollow" href="privacypolicy.php" style="color:white;">Privacy Policy</a></p>
                <p><a rel="nofollow" href="termsandconditions.php" style="color:white;">Terms of Use</a></p>
            </div>
     </div>
        
        
    <p style="color:white;">© <span style="color: orange">T</span>each<span style="color: Cyan">Y</span>ourself<span style="color: Lime">P</span>ython By www.TeachingComputing.com</p>
</div>

<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-85714062-1', 'auto');
  ga('send', 'pageview');

</script>

    </footer>
    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <script src="bootstrap-assets/js/bootstrap.min.js"></script>
    <script src="js/custom.js"></script>

    <!-- JS PLUGINS -->
    <script src="js/prism.js"></script>

    <script src="plugins/owl-carousel/owl.carousel.min.js"></script>
    <script src="js/jquery.easing.min.js"></script>
    <script src="plugins/waypoints/jquery.waypoints.min.js"></script>
    <script src="plugins/countTo/jquery.countTo.js"></script>
    <script src="plugins/inview/jquery.inview.min.js"></script>
    <script src="plugins/Lightbox/dist/js/lightbox.min.js"></script><div id="lightboxOverlay" class="lightboxOverlay" style="display: none;"></div><div id="lightbox" class="lightbox" style="display: none;"><div class="lb-outerContainer"><div class="lb-container"><img class="lb-image" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="><div class="lb-nav"><a class="lb-prev" href=""></a><a class="lb-next" href=""></a></div><div class="lb-loader"><a class="lb-cancel"></a></div></div></div><div class="lb-dataContainer"><div class="lb-data"><div class="lb-details"><span class="lb-caption"></span><span class="lb-number"></span></div><div class="lb-closeContainer"><a class="lb-close"></a></div></div></div></div>
    <script src="plugins/WOW/dist/wow.min.js"></script>
    <!-- GOOGLE MAP -->
    <script src="https://maps.googleapis.com/maps/api/js"></script>












<iframe id="google_osd_static_frame_9623346896934" name="google_osd_static_frame" style="display: none; width: 0px; height: 0px;"></iframe></body><iframe id="google_esf" name="google_esf" src="https://googleads.g.doubleclick.net/pagead/html/r20190429/r20190131/zrt_lookup.html#" data-ad-client="ca-pub-9043920153844099" style="display: none;"></iframe></html>
"""

from html.parser import HTMLParser
import re

re_link = re.compile(r"^show-code.php?(?P<path>.*?)$")

class MyHTMLParser(HTMLParser):

    def handle_starttag(self, tag, attrs):
        try:
            if self.my_urls_ == None: pass
        except:
            self.my_urls_ = []
        if tag == 'a':
            for attr in attrs:
                if attr[0] == 'href':
                    m = re_link.match(attr[1])
                    if m:
                        self.my_urls_.append('https://teachyourselfpython.com/' + m.group(0))

    @property
    def my_urls(self):
        return self.my_urls_

parser = MyHTMLParser()


parser.feed(page)

print(*parser.my_urls, sep='\n')

import pathlib

root = pathlib.Path(__file__).absolute().parent.parent
out_path = root / 'snippets' / 'urls.txt'
out_path.write_text('\n'.join(parser.my_urls))

