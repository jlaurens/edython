/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */

/**
 * @fileoverview calendar module. Automatically generated by `python3 bin/helpers/modulebot.py calendar`
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('Module')

eYo.provide('Module.calendar__module', new eYo.Module.Dflt('calendar__module', 'https://docs.python.org/3.6/library/calendar.html'))

;(function () {

  /* Singleton constructor */
  var Item = function (model) {
    eYo.Module.Item.call(this, model)
  }

  goog.inherits(Item, eYo.Module.Item)

  /**
  * module
  */
  Item.prototype.module = eYo.Module.calendar__module

  Object.defineProperties(Item.prototype, {
    url: {
      get() {
        return this.href
          ? this.module.url + this.href
          : this.module.url
      }
    }
  })

eYo.Module.calendar__module.data = {
  categories: [
    'module-calendar'
  ],
  types: [
    'class',
    'function',
    'data',
    'method'
  ],
  items: [
    new Item({
      name: 'Calendar',
      class: 'calendar',
      category: 0,
      type_: 0,
      href: '#calendar.Calendar',
      stmt: true,
      ary: 1,
      mandatory: 0,
      arguments: [
        {
          name: 'firstweekday',
          default: 0
        }
      ]
    }),
    new Item({
      name: 'HTMLCalendar',
      class: 'calendar',
      category: 0,
      type_: 0,
      href: '#calendar.HTMLCalendar',
      stmt: true,
      ary: 1,
      mandatory: 0,
      arguments: [
        {
          name: 'firstweekday',
          default: 0
        }
      ]
    }),
    new Item({
      name: 'LocaleHTMLCalendar',
      class: 'calendar',
      category: 0,
      type_: 0,
      href: '#calendar.LocaleHTMLCalendar',
      ary: 2,
      mandatory: 0,
      arguments: [
        {
          name: 'firstweekday',
          default: 0
        },
        {
          name: 'locale',
          default: 'None'
        }
      ]
    }),
    new Item({
      name: 'LocaleTextCalendar',
      class: 'calendar',
      category: 0,
      type_: 0,
      href: '#calendar.LocaleTextCalendar',
      ary: 2,
      mandatory: 0,
      arguments: [
        {
          name: 'firstweekday',
          default: 0
        },
        {
          name: 'locale',
          default: 'None'
        }
      ]
    }),
    new Item({
      name: 'TextCalendar',
      class: 'calendar',
      category: 0,
      type_: 0,
      href: '#calendar.TextCalendar',
      stmt: true,
      ary: 1,
      mandatory: 0,
      arguments: [
        {
          name: 'firstweekday',
          default: 0
        }
      ]
    }),
    new Item({
      name: 'calendar',
      class: 'calendar',
      category: 0,
      type_: 1,
      href: '#calendar.calendar',
      ary: 5,
      mandatory: 1,
      arguments: [
        {
          name: 'year'
        },
        {
          name: 'w',
          default: 2
        },
        {
          name: 'l',
          default: 1
        },
        {
          name: 'c',
          default: 6
        },
        {
          name: 'm',
          default: 3
        }
      ]
    }),
    new Item({
      name: 'day_abbr',
      class: 'calendar',
      category: 0,
      type_: 2,
      href: '#calendar.day_abbr',
      stmt: true,
      ary: 0
    }),
    new Item({
      name: 'day_name',
      class: 'calendar',
      category: 0,
      type_: 2,
      href: '#calendar.day_name',
      stmt: true,
      ary: 0
    }),
    new Item({
      name: 'firstweekday',
      class: 'calendar',
      category: 0,
      type_: 1,
      href: '#calendar.firstweekday',
      ary: 0
    }),
    new Item({
      name: 'formatmonth',
      class: 'calendar.TextCalendar',
      category: 0,
      type_: 3,
      href: '#calendar.TextCalendar.formatmonth',
      ary: 4,
      mandatory: 2,
      arguments: [
        {
          name: 'theyear'
        },
        {
          name: 'themonth'
        },
        {
          name: 'w',
          default: 0
        },
        {
          name: 'l',
          default: 0
        }
      ]
    }),
    new Item({
      name: 'formatmonth',
      class: 'calendar.HTMLCalendar',
      category: 0,
      type_: 3,
      href: '#calendar.HTMLCalendar.formatmonth',
      ary: 3,
      mandatory: 2,
      arguments: [
        {
          name: 'theyear'
        },
        {
          name: 'themonth'
        },
        {
          name: 'withyear',
          default: 'True'
        }
      ]
    }),
    new Item({
      name: 'formatyear',
      class: 'calendar.TextCalendar',
      category: 0,
      type_: 3,
      href: '#calendar.TextCalendar.formatyear',
      ary: 5,
      mandatory: 1,
      arguments: [
        {
          name: 'theyear'
        },
        {
          name: 'w',
          default: 2
        },
        {
          name: 'l',
          default: 1
        },
        {
          name: 'c',
          default: 6
        },
        {
          name: 'm',
          default: 3
        }
      ]
    }),
    new Item({
      name: 'formatyear',
      class: 'calendar.HTMLCalendar',
      category: 0,
      type_: 3,
      href: '#calendar.HTMLCalendar.formatyear',
      ary: 2,
      mandatory: 1,
      arguments: [
        {
          name: 'theyear'
        },
        {
          name: 'width',
          default: 3
        }
      ]
    }),
    new Item({
      name: 'formatyearpage',
      class: 'calendar.HTMLCalendar',
      category: 0,
      type_: 3,
      href: '#calendar.HTMLCalendar.formatyearpage',
      ary: 4,
      mandatory: 1,
      arguments: [
        {
          name: 'theyear'
        },
        {
          name: 'width',
          default: 3
        },
        {
          name: 'css',
          default: '\'calendar.css\''
        },
        {
          name: 'encoding',
          default: 'None'
        }
      ]
    }),
    new Item({
      name: 'isleap',
      class: 'calendar',
      category: 0,
      type_: 1,
      href: '#calendar.isleap',
      ary: 1,
      arguments: [
        {
          name: 'year'
        }
      ]
    }),
    new Item({
      name: 'itermonthdates',
      class: 'calendar.Calendar',
      category: 0,
      type_: 3,
      href: '#calendar.Calendar.itermonthdates',
      ary: 2,
      arguments: [
        {
          name: 'year'
        },
        {
          name: 'month'
        }
      ]
    }),
    new Item({
      name: 'itermonthdays',
      class: 'calendar.Calendar',
      category: 0,
      type_: 3,
      href: '#calendar.Calendar.itermonthdays',
      ary: 2,
      arguments: [
        {
          name: 'year'
        },
        {
          name: 'month'
        }
      ]
    }),
    new Item({
      name: 'itermonthdays2',
      class: 'calendar.Calendar',
      category: 0,
      type_: 3,
      href: '#calendar.Calendar.itermonthdays2',
      ary: 2,
      arguments: [
        {
          name: 'year'
        },
        {
          name: 'month'
        }
      ]
    }),
    new Item({
      name: 'iterweekdays',
      class: 'calendar.Calendar',
      category: 0,
      type_: 3,
      href: '#calendar.Calendar.iterweekdays',
      ary: 0
    }),
    new Item({
      name: 'leapdays',
      class: 'calendar',
      category: 0,
      type_: 1,
      href: '#calendar.leapdays',
      ary: 2,
      arguments: [
        {
          name: 'y1'
        },
        {
          name: 'y2'
        }
      ]
    }),
    new Item({
      name: 'month',
      class: 'calendar',
      category: 0,
      type_: 1,
      href: '#calendar.month',
      ary: 4,
      mandatory: 2,
      arguments: [
        {
          name: 'theyear'
        },
        {
          name: 'themonth'
        },
        {
          name: 'w',
          default: 0
        },
        {
          name: 'l',
          default: 0
        }
      ]
    }),
    new Item({
      name: 'month_abbr',
      class: 'calendar',
      category: 0,
      type_: 2,
      href: '#calendar.month_abbr',
      stmt: true,
      ary: 0
    }),
    new Item({
      name: 'month_name',
      class: 'calendar',
      category: 0,
      type_: 2,
      href: '#calendar.month_name',
      stmt: true,
      ary: 0
    }),
    new Item({
      name: 'monthcalendar',
      class: 'calendar',
      category: 0,
      type_: 1,
      href: '#calendar.monthcalendar',
      ary: 2,
      arguments: [
        {
          name: 'year'
        },
        {
          name: 'month'
        }
      ]
    }),
    new Item({
      name: 'monthdatescalendar',
      class: 'calendar.Calendar',
      category: 0,
      type_: 3,
      href: '#calendar.Calendar.monthdatescalendar',
      ary: 2,
      arguments: [
        {
          name: 'year'
        },
        {
          name: 'month'
        }
      ]
    }),
    new Item({
      name: 'monthdays2calendar',
      class: 'calendar.Calendar',
      category: 0,
      type_: 3,
      href: '#calendar.Calendar.monthdays2calendar',
      ary: 2,
      arguments: [
        {
          name: 'year'
        },
        {
          name: 'month'
        }
      ]
    }),
    new Item({
      name: 'monthdayscalendar',
      class: 'calendar.Calendar',
      category: 0,
      type_: 3,
      href: '#calendar.Calendar.monthdayscalendar',
      ary: 2,
      arguments: [
        {
          name: 'year'
        },
        {
          name: 'month'
        }
      ]
    }),
    new Item({
      name: 'monthrange',
      class: 'calendar',
      category: 0,
      type_: 1,
      href: '#calendar.monthrange',
      ary: 2,
      arguments: [
        {
          name: 'year'
        },
        {
          name: 'month'
        }
      ]
    }),
    new Item({
      name: 'prcal',
      class: 'calendar',
      category: 0,
      type_: 1,
      href: '#calendar.prcal',
      ary: 5,
      mandatory: 1,
      arguments: [
        {
          name: 'year'
        },
        {
          name: 'w',
          default: 0
        },
        {
          name: 'l',
          default: 0
        },
        {
          name: 'c',
          default: 6
        },
        {
          name: 'm',
          default: 3
        }
      ]
    }),
    new Item({
      name: 'prmonth',
      class: 'calendar',
      category: 0,
      type_: 1,
      href: '#calendar.prmonth',
      ary: 4,
      mandatory: 2,
      arguments: [
        {
          name: 'theyear'
        },
        {
          name: 'themonth'
        },
        {
          name: 'w',
          default: 0
        },
        {
          name: 'l',
          default: 0
        }
      ]
    }),
    new Item({
      name: 'prmonth',
      class: 'calendar.TextCalendar',
      category: 0,
      type_: 3,
      href: '#calendar.TextCalendar.prmonth',
      ary: 4,
      mandatory: 2,
      arguments: [
        {
          name: 'theyear'
        },
        {
          name: 'themonth'
        },
        {
          name: 'w',
          default: 0
        },
        {
          name: 'l',
          default: 0
        }
      ]
    }),
    new Item({
      name: 'pryear',
      class: 'calendar.TextCalendar',
      category: 0,
      type_: 3,
      href: '#calendar.TextCalendar.pryear',
      ary: 5,
      mandatory: 1,
      arguments: [
        {
          name: 'theyear'
        },
        {
          name: 'w',
          default: 2
        },
        {
          name: 'l',
          default: 1
        },
        {
          name: 'c',
          default: 6
        },
        {
          name: 'm',
          default: 3
        }
      ]
    }),
    new Item({
      name: 'setfirstweekday',
      class: 'calendar',
      category: 0,
      type_: 1,
      href: '#calendar.setfirstweekday',
      stmt: true,
      ary: 1,
      arguments: [
        {
          name: 'weekday'
        }
      ]
    }),
    new Item({
      name: 'timegm',
      class: 'calendar',
      category: 0,
      type_: 1,
      href: '#calendar.timegm',
      ary: 1,
      arguments: [
        {
          name: 'tuple'
        }
      ]
    }),
    new Item({
      name: 'weekday',
      class: 'calendar',
      category: 0,
      type_: 1,
      href: '#calendar.weekday',
      ary: 3,
      arguments: [
        {
          name: 'year'
        },
        {
          name: 'month'
        },
        {
          name: 'day'
        }
      ]
    }),
    new Item({
      name: 'weekheader',
      class: 'calendar',
      category: 0,
      type_: 1,
      href: '#calendar.weekheader',
      ary: 1,
      arguments: [
        {
          name: 'n'
        }
      ]
    }),
    new Item({
      name: 'yeardatescalendar',
      class: 'calendar.Calendar',
      category: 0,
      type_: 3,
      href: '#calendar.Calendar.yeardatescalendar',
      ary: 2,
      mandatory: 1,
      arguments: [
        {
          name: 'year'
        },
        {
          name: 'width',
          default: 3
        }
      ]
    }),
    new Item({
      name: 'yeardays2calendar',
      class: 'calendar.Calendar',
      category: 0,
      type_: 3,
      href: '#calendar.Calendar.yeardays2calendar',
      ary: 2,
      mandatory: 1,
      arguments: [
        {
          name: 'year'
        },
        {
          name: 'width',
          default: 3
        }
      ]
    }),
    new Item({
      name: 'yeardayscalendar',
      class: 'calendar.Calendar',
      category: 0,
      type_: 3,
      href: '#calendar.Calendar.yeardayscalendar',
      ary: 2,
      mandatory: 1,
      arguments: [
        {
          name: 'year'
        },
        {
          name: 'width',
          default: 3
        }
      ]
    })
  ],
  by_name: {
    'Calendar': 0,
    'HTMLCalendar': 1,
    'LocaleHTMLCalendar': 2,
    'LocaleTextCalendar': 3,
    'TextCalendar': 4,
    'calendar': 5,
    'day_abbr': 6,
    'day_name': 7,
    'firstweekday': 8,
    'formatmonth': 10,
    'formatyear': 12,
    'formatyearpage': 13,
    'isleap': 14,
    'itermonthdates': 15,
    'itermonthdays': 16,
    'itermonthdays2': 17,
    'iterweekdays': 18,
    'leapdays': 19,
    'month': 20,
    'month_abbr': 21,
    'month_name': 22,
    'monthcalendar': 23,
    'monthdatescalendar': 24,
    'monthdays2calendar': 25,
    'monthdayscalendar': 26,
    'monthrange': 27,
    'prcal': 28,
    'prmonth': 30,
    'pryear': 31,
    'setfirstweekday': 32,
    'timegm': 33,
    'weekday': 34,
    'weekheader': 35,
    'yeardatescalendar': 36,
    'yeardays2calendar': 37,
    'yeardayscalendar': 38
  },
  by_category: {
    0: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38]
  },
  by_type: {
    0: [0, 1, 2, 3, 4],
    1: [5, 8, 14, 19, 20, 23, 27, 28, 29, 32, 33, 34, 35],
    2: [6, 7, 21, 22],
    3: [9, 10, 11, 12, 13, 15, 16, 17, 18, 24, 25, 26, 30, 31, 36, 37, 38]
  }
}


})()


// This file was generated by `python3 ./bin/helpers/modulebot.py calendar` on 2019-12-12 13:35:33.049457


