def open(cls):
  def update(extension):
    for k,v in extension.__dict__.items():
      if k != '__dict__':
        setattr(cls,k,v)
    return cls
  return update

def open(cls):
  def update(extension):
    namespace = dict(cls.__dict__)
    namespace.update(dict(extension.__dict__))
    return type(cls.__name__,cls.__bases__,namespace)
  return update

class A(object):
  def hello(self):
    print('Hello!')

A().hello()   #=> Hello!

#reopen class A
@open(A)
class A(object):
  def hello(self):
    print('New hello!')
  def bye(self):
    print('Bye bye')


A().hello()   #=> New hello!
A().bye()     #=> Bye bye

@open(A)
class int:
  def hello(self):
    print('New hello!')
  def bye(self):
    print('Bye bye')



def hello(self):
    print('New hello!')

setattr(int,'hello', hello)


#10 .hello()
