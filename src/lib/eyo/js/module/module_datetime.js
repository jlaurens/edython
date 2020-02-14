/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */

/**
 * @fileoverview datetime module. Automatically generated by `python3 bin/helpers/modulebot.py datetime through npm run eyo:module`
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.module.makeNS('datetime__module')

eYo.module.datetime__module.url = 'https://docs.python.org/3.6/library/datetime.html'

;(() => {
  /* Singleton constructor */
  var Item = eYo.module.datetime__module.makeItem()


  eYo.module.datetime__module.data_ = {
    categories: [
      'module-datetime',
      'available-types',
      'timedelta-objects',
      'date-objects',
      'datetime-objects',
      'time-objects',
      'tzinfo-objects',
      'timezone-objects'
    ],
    types: [
      'data',
      'class',
      'attribute',
      'method',
      'classmethod'
    ],
    items: [
      new Item({
        name: 'MAXYEAR',
        class: 'datetime',
        category: 0,
        type_: 0,
        href: '#datetime.MAXYEAR',
        stmt: true,
        ary: 0
      }),
      new Item({
        name: 'MINYEAR',
        class: 'datetime',
        category: 0,
        type_: 0,
        href: '#datetime.MINYEAR',
        stmt: true,
        ary: 0
      }),
      new Item({
        name: '__format__',
        class: 'date',
        holder: 'datetime.date',
        category: 3,
        type_: 3,
        href: '#datetime.date.__format__',
        stmt: true,
        ary: 1,
        arguments: [
          {
            name: 'format'
          }
        ]
      }),
      new Item({
        name: '__format__',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 3,
        href: '#datetime.datetime.__format__',
        stmt: true,
        ary: 1,
        arguments: [
          {
            name: 'format'
          }
        ]
      }),
      new Item({
        name: '__format__',
        class: 'time',
        holder: 'datetime.time',
        category: 5,
        type_: 3,
        href: '#datetime.time.__format__',
        stmt: true,
        ary: 1,
        arguments: [
          {
            name: 'format'
          }
        ]
      }),
      new Item({
        name: '__str__',
        class: 'date',
        holder: 'datetime.date',
        category: 3,
        type_: 3,
        href: '#datetime.date.__str__',
        stmt: true,
        ary: 0
      }),
      new Item({
        name: '__str__',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 3,
        href: '#datetime.datetime.__str__',
        stmt: true,
        ary: 0
      }),
      new Item({
        name: '__str__',
        class: 'time',
        holder: 'datetime.time',
        category: 5,
        type_: 3,
        href: '#datetime.time.__str__',
        stmt: true,
        ary: 0
      }),
      new Item({
        name: 'astimezone',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 3,
        href: '#datetime.datetime.astimezone',
        ary: 1,
        mandatory: 0,
        arguments: [
          {
            name: 'tz',
            default: 'None'
          }
        ]
      }),
      new Item({
        name: 'combine',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 4,
        href: '#datetime.datetime.combine',
        ary: 3,
        mandatory: 2,
        arguments: [
          {
            name: 'date'
          },
          {
            name: 'time'
          },
          {
            name: 'tzinfo',
            default: 'self.tzinfo'
          }
        ]
      }),
      new Item({
        name: 'ctime',
        class: 'date',
        holder: 'datetime.date',
        category: 3,
        type_: 3,
        href: '#datetime.date.ctime',
        ary: 0
      }),
      new Item({
        name: 'ctime',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 3,
        href: '#datetime.datetime.ctime',
        ary: 0
      }),
      new Item({
        name: 'date',
        class: 'datetime',
        category: 1,
        type_: 1,
        stmt: true,
        ary: 0
      }),
      new Item({
        name: 'date',
        class: 'datetime',
        category: 3,
        type_: 1,
        href: '#datetime.date',
        stmt: true,
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
        name: 'date',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 3,
        href: '#datetime.datetime.date',
        ary: 0
      }),
      new Item({
        name: 'datetime',
        class: 'datetime',
        category: 1,
        type_: 1,
        stmt: true,
        ary: 0
      }),
      new Item({
        name: 'datetime',
        class: 'datetime',
        category: 4,
        type_: 1,
        href: '#datetime.datetime',
        stmt: true,
        ary: Infinity,
        mandatory: 3,
        arguments: [
          {
            name: 'year'
          },
          {
            name: 'month'
          },
          {
            name: 'day'
          },
          {
            name: 'hour',
            default: 0
          },
          {
            name: 'minute',
            default: 0
          },
          {
            name: 'second',
            default: 0
          },
          {
            name: 'microsecond',
            default: 0
          },
          {
            name: 'tzinfo',
            default: 'None'
          },
          {
            name: '*',
            optional: true
          },
          {
            name: 'fold',
            default: 0
          }
        ]
      }),
      new Item({
        name: 'day',
        class: 'date',
        holder: 'datetime.date',
        category: 3,
        type_: 2,
        href: '#datetime.date.day',
        ary: 0
      }),
      new Item({
        name: 'day',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 2,
        href: '#datetime.datetime.day',
        ary: 0
      }),
      new Item({
        name: 'dst',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 3,
        href: '#datetime.datetime.dst',
        ary: 0
      }),
      new Item({
        name: 'dst',
        class: 'time',
        holder: 'datetime.time',
        category: 5,
        type_: 3,
        href: '#datetime.time.dst',
        ary: 0
      }),
      new Item({
        name: 'dst',
        class: 'tzinfo',
        holder: 'datetime.tzinfo',
        category: 6,
        type_: 3,
        href: '#datetime.tzinfo.dst',
        ary: 1,
        arguments: [
          {
            name: 'dt'
          }
        ]
      }),
      new Item({
        name: 'dst',
        class: 'timezone',
        holder: 'datetime.timezone',
        category: 7,
        type_: 3,
        href: '#datetime.timezone.dst',
        ary: 1,
        arguments: [
          {
            name: 'dt'
          }
        ]
      }),
      new Item({
        name: 'fold',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 2,
        href: '#datetime.datetime.fold',
        ary: 0
      }),
      new Item({
        name: 'fold',
        class: 'time',
        holder: 'datetime.time',
        category: 5,
        type_: 2,
        href: '#datetime.time.fold',
        ary: 0
      }),
      new Item({
        name: 'fromordinal',
        class: 'date',
        holder: 'datetime.date',
        category: 3,
        type_: 4,
        href: '#datetime.date.fromordinal',
        ary: 1,
        arguments: [
          {
            name: 'ordinal'
          }
        ]
      }),
      new Item({
        name: 'fromordinal',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 4,
        href: '#datetime.datetime.fromordinal',
        ary: 1,
        arguments: [
          {
            name: 'ordinal'
          }
        ]
      }),
      new Item({
        name: 'fromtimestamp',
        class: 'date',
        holder: 'datetime.date',
        category: 3,
        type_: 4,
        href: '#datetime.date.fromtimestamp',
        ary: 1,
        arguments: [
          {
            name: 'timestamp'
          }
        ]
      }),
      new Item({
        name: 'fromtimestamp',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 4,
        href: '#datetime.datetime.fromtimestamp',
        ary: 2,
        mandatory: 1,
        arguments: [
          {
            name: 'timestamp'
          },
          {
            name: 'tz',
            default: 'None'
          }
        ]
      }),
      new Item({
        name: 'fromutc',
        class: 'tzinfo',
        holder: 'datetime.tzinfo',
        category: 6,
        type_: 3,
        href: '#datetime.tzinfo.fromutc',
        stmt: true,
        ary: 1,
        arguments: [
          {
            name: 'dt'
          }
        ]
      }),
      new Item({
        name: 'fromutc',
        class: 'timezone',
        holder: 'datetime.timezone',
        category: 7,
        type_: 3,
        href: '#datetime.timezone.fromutc',
        ary: 1,
        arguments: [
          {
            name: 'dt'
          }
        ]
      }),
      new Item({
        name: 'hour',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 2,
        href: '#datetime.datetime.hour',
        ary: 0
      }),
      new Item({
        name: 'hour',
        class: 'time',
        holder: 'datetime.time',
        category: 5,
        type_: 2,
        href: '#datetime.time.hour',
        ary: 0
      }),
      new Item({
        name: 'isocalendar',
        class: 'date',
        holder: 'datetime.date',
        category: 3,
        type_: 3,
        href: '#datetime.date.isocalendar',
        ary: 0
      }),
      new Item({
        name: 'isocalendar',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 3,
        href: '#datetime.datetime.isocalendar',
        ary: 0
      }),
      new Item({
        name: 'isoformat',
        class: 'date',
        holder: 'datetime.date',
        category: 3,
        type_: 3,
        href: '#datetime.date.isoformat',
        ary: 0
      }),
      new Item({
        name: 'isoformat',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 3,
        href: '#datetime.datetime.isoformat',
        ary: 2,
        mandatory: 0,
        arguments: [
          {
            name: 'sep',
            default: '\'T\''
          },
          {
            name: 'timespec',
            default: '\'auto\''
          }
        ]
      }),
      new Item({
        name: 'isoformat',
        class: 'time',
        holder: 'datetime.time',
        category: 5,
        type_: 3,
        href: '#datetime.time.isoformat',
        ary: 1,
        mandatory: 0,
        arguments: [
          {
            name: 'timespec',
            default: '\'auto\''
          }
        ]
      }),
      new Item({
        name: 'isoweekday',
        class: 'date',
        holder: 'datetime.date',
        category: 3,
        type_: 3,
        href: '#datetime.date.isoweekday',
        ary: 0
      }),
      new Item({
        name: 'isoweekday',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 3,
        href: '#datetime.datetime.isoweekday',
        ary: 0
      }),
      new Item({
        name: 'max',
        class: 'timedelta',
        holder: 'datetime.timedelta',
        category: 2,
        type_: 2,
        href: '#datetime.timedelta.max',
        ary: 0
      }),
      new Item({
        name: 'max',
        class: 'date',
        holder: 'datetime.date',
        category: 3,
        type_: 2,
        href: '#datetime.date.max',
        ary: 0
      }),
      new Item({
        name: 'max',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 2,
        href: '#datetime.datetime.max',
        ary: 0
      }),
      new Item({
        name: 'max',
        class: 'time',
        holder: 'datetime.time',
        category: 5,
        type_: 2,
        href: '#datetime.time.max',
        ary: 0
      }),
      new Item({
        name: 'microsecond',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 2,
        href: '#datetime.datetime.microsecond',
        ary: 0
      }),
      new Item({
        name: 'microsecond',
        class: 'time',
        holder: 'datetime.time',
        category: 5,
        type_: 2,
        href: '#datetime.time.microsecond',
        ary: 0
      }),
      new Item({
        name: 'min',
        class: 'timedelta',
        holder: 'datetime.timedelta',
        category: 2,
        type_: 2,
        href: '#datetime.timedelta.min',
        ary: 0
      }),
      new Item({
        name: 'min',
        class: 'date',
        holder: 'datetime.date',
        category: 3,
        type_: 2,
        href: '#datetime.date.min',
        ary: 0
      }),
      new Item({
        name: 'min',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 2,
        href: '#datetime.datetime.min',
        ary: 0
      }),
      new Item({
        name: 'min',
        class: 'time',
        holder: 'datetime.time',
        category: 5,
        type_: 2,
        href: '#datetime.time.min',
        ary: 0
      }),
      new Item({
        name: 'minute',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 2,
        href: '#datetime.datetime.minute',
        ary: 0
      }),
      new Item({
        name: 'minute',
        class: 'time',
        holder: 'datetime.time',
        category: 5,
        type_: 2,
        href: '#datetime.time.minute',
        ary: 0
      }),
      new Item({
        name: 'month',
        class: 'date',
        holder: 'datetime.date',
        category: 3,
        type_: 2,
        href: '#datetime.date.month',
        ary: 0
      }),
      new Item({
        name: 'month',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 2,
        href: '#datetime.datetime.month',
        ary: 0
      }),
      new Item({
        name: 'now',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 4,
        href: '#datetime.datetime.now',
        ary: 1,
        mandatory: 0,
        arguments: [
          {
            name: 'tz',
            default: 'None'
          }
        ]
      }),
      new Item({
        name: 'replace',
        class: 'date',
        holder: 'datetime.date',
        category: 3,
        type_: 3,
        href: '#datetime.date.replace',
        ary: 3,
        mandatory: 0,
        arguments: [
          {
            name: 'year',
            default: 'self.year'
          },
          {
            name: 'month',
            default: 'self.month'
          },
          {
            name: 'day',
            default: 'self.day'
          }
        ]
      }),
      new Item({
        name: 'replace',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 3,
        href: '#datetime.datetime.replace',
        ary: Infinity,
        mandatory: 0,
        arguments: [
          {
            name: 'year',
            default: 'self.year'
          },
          {
            name: 'month',
            default: 'self.month'
          },
          {
            name: 'day',
            default: 'self.day'
          },
          {
            name: 'hour',
            default: 'self.hour'
          },
          {
            name: 'minute',
            default: 'self.minute'
          },
          {
            name: 'second',
            default: 'self.second'
          },
          {
            name: 'microsecond',
            default: 'self.microsecond'
          },
          {
            name: 'tzinfo',
            default: 'self.tzinfo'
          },
          {
            name: '*',
            optional: true
          }
        ]
      }),
      new Item({
        name: 'replace',
        class: 'time',
        holder: 'datetime.time',
        category: 5,
        type_: 3,
        href: '#datetime.time.replace',
        ary: Infinity,
        mandatory: 0,
        arguments: [
          {
            name: 'hour',
            default: 'self.hour'
          },
          {
            name: 'minute',
            default: 'self.minute'
          },
          {
            name: 'second',
            default: 'self.second'
          },
          {
            name: 'microsecond',
            default: 'self.microsecond'
          },
          {
            name: 'tzinfo',
            default: 'self.tzinfo'
          },
          {
            name: '*',
            optional: true
          }
        ]
      }),
      new Item({
        name: 'resolution',
        class: 'timedelta',
        holder: 'datetime.timedelta',
        category: 2,
        type_: 2,
        href: '#datetime.timedelta.resolution',
        ary: 0
      }),
      new Item({
        name: 'resolution',
        class: 'date',
        holder: 'datetime.date',
        category: 3,
        type_: 2,
        href: '#datetime.date.resolution',
        ary: 0
      }),
      new Item({
        name: 'resolution',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 2,
        href: '#datetime.datetime.resolution',
        ary: 0
      }),
      new Item({
        name: 'resolution',
        class: 'time',
        holder: 'datetime.time',
        category: 5,
        type_: 2,
        href: '#datetime.time.resolution',
        ary: 0
      }),
      new Item({
        name: 'second',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 2,
        href: '#datetime.datetime.second',
        ary: 0
      }),
      new Item({
        name: 'second',
        class: 'time',
        holder: 'datetime.time',
        category: 5,
        type_: 2,
        href: '#datetime.time.second',
        ary: 0
      }),
      new Item({
        name: 'strftime',
        class: 'date',
        holder: 'datetime.date',
        category: 3,
        type_: 3,
        href: '#datetime.date.strftime',
        ary: 1,
        arguments: [
          {
            name: 'format'
          }
        ]
      }),
      new Item({
        name: 'strftime',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 3,
        href: '#datetime.datetime.strftime',
        ary: 1,
        arguments: [
          {
            name: 'format'
          }
        ]
      }),
      new Item({
        name: 'strftime',
        class: 'time',
        holder: 'datetime.time',
        category: 5,
        type_: 3,
        href: '#datetime.time.strftime',
        ary: 1,
        arguments: [
          {
            name: 'format'
          }
        ]
      }),
      new Item({
        name: 'strptime',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 4,
        href: '#datetime.datetime.strptime',
        ary: 2,
        arguments: [
          {
            name: 'date_string'
          },
          {
            name: 'format'
          }
        ]
      }),
      new Item({
        name: 'time',
        class: 'datetime',
        category: 1,
        type_: 1,
        stmt: true,
        ary: 0
      }),
      new Item({
        name: 'time',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 3,
        href: '#datetime.datetime.time',
        ary: 0
      }),
      new Item({
        name: 'time',
        class: 'datetime',
        category: 5,
        type_: 1,
        href: '#datetime.time',
        stmt: true,
        ary: Infinity,
        mandatory: 0,
        arguments: [
          {
            name: 'hour',
            default: 0
          },
          {
            name: 'minute',
            default: 0
          },
          {
            name: 'second',
            default: 0
          },
          {
            name: 'microsecond',
            default: 0
          },
          {
            name: 'tzinfo',
            default: 'None'
          },
          {
            name: '*',
            optional: true
          },
          {
            name: 'fold',
            default: 0
          }
        ]
      }),
      new Item({
        name: 'timedelta',
        class: 'datetime',
        category: 1,
        type_: 1,
        stmt: true,
        ary: 0
      }),
      new Item({
        name: 'timedelta',
        class: 'datetime',
        category: 2,
        type_: 1,
        href: '#datetime.timedelta',
        stmt: true,
        ary: 7,
        mandatory: 0,
        arguments: [
          {
            name: 'days',
            default: 0
          },
          {
            name: 'seconds',
            default: 0
          },
          {
            name: 'microseconds',
            default: 0
          },
          {
            name: 'milliseconds',
            default: 0
          },
          {
            name: 'minutes',
            default: 0
          },
          {
            name: 'hours',
            default: 0
          },
          {
            name: 'weeks',
            default: 0
          }
        ]
      }),
      new Item({
        name: 'timestamp',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 3,
        href: '#datetime.datetime.timestamp',
        ary: 0
      }),
      new Item({
        name: 'timetuple',
        class: 'date',
        holder: 'datetime.date',
        category: 3,
        type_: 3,
        href: '#datetime.date.timetuple',
        ary: 0
      }),
      new Item({
        name: 'timetuple',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 3,
        href: '#datetime.datetime.timetuple',
        ary: 0
      }),
      new Item({
        name: 'timetz',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 3,
        href: '#datetime.datetime.timetz',
        ary: 0
      }),
      new Item({
        name: 'timezone',
        class: 'datetime',
        category: 1,
        type_: 1,
        stmt: true,
        ary: 0
      }),
      new Item({
        name: 'timezone',
        class: 'datetime',
        category: 7,
        type_: 1,
        href: '#datetime.timezone',
        stmt: true,
        ary: 2,
        mandatory: 1,
        arguments: [
          {
            name: 'offset'
          },
          {
            name: 'name',
            default: 'None'
          }
        ]
      }),
      new Item({
        name: 'today',
        class: 'date',
        holder: 'datetime.date',
        category: 3,
        type_: 4,
        href: '#datetime.date.today',
        ary: 0
      }),
      new Item({
        name: 'today',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 4,
        href: '#datetime.datetime.today',
        ary: 0
      }),
      new Item({
        name: 'toordinal',
        class: 'date',
        holder: 'datetime.date',
        category: 3,
        type_: 3,
        href: '#datetime.date.toordinal',
        ary: 0
      }),
      new Item({
        name: 'toordinal',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 3,
        href: '#datetime.datetime.toordinal',
        ary: 0
      }),
      new Item({
        name: 'total_seconds',
        class: 'timedelta',
        holder: 'datetime.timedelta',
        category: 2,
        type_: 3,
        href: '#datetime.timedelta.total_seconds',
        ary: 0
      }),
      new Item({
        name: 'tzinfo',
        class: 'datetime',
        category: 1,
        type_: 1,
        stmt: true,
        ary: 0
      }),
      new Item({
        name: 'tzinfo',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 2,
        href: '#datetime.datetime.tzinfo',
        ary: 0
      }),
      new Item({
        name: 'tzinfo',
        class: 'time',
        holder: 'datetime.time',
        category: 5,
        type_: 2,
        href: '#datetime.time.tzinfo',
        ary: 0
      }),
      new Item({
        name: 'tzinfo',
        class: 'datetime',
        category: 6,
        type_: 1,
        href: '#datetime.tzinfo',
        stmt: true,
        ary: 0
      }),
      new Item({
        name: 'tzname',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 3,
        href: '#datetime.datetime.tzname',
        ary: 0
      }),
      new Item({
        name: 'tzname',
        class: 'time',
        holder: 'datetime.time',
        category: 5,
        type_: 3,
        href: '#datetime.time.tzname',
        ary: 0
      }),
      new Item({
        name: 'tzname',
        class: 'tzinfo',
        holder: 'datetime.tzinfo',
        category: 6,
        type_: 3,
        href: '#datetime.tzinfo.tzname',
        ary: 1,
        arguments: [
          {
            name: 'dt'
          }
        ]
      }),
      new Item({
        name: 'tzname',
        class: 'timezone',
        holder: 'datetime.timezone',
        category: 7,
        type_: 3,
        href: '#datetime.timezone.tzname',
        ary: 1,
        arguments: [
          {
            name: 'dt'
          }
        ]
      }),
      new Item({
        name: 'utc',
        class: 'timezone',
        holder: 'datetime.timezone',
        category: 7,
        type_: 2,
        href: '#datetime.timezone.utc',
        ary: 0
      }),
      new Item({
        name: 'utcfromtimestamp',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 4,
        href: '#datetime.datetime.utcfromtimestamp',
        ary: 1,
        arguments: [
          {
            name: 'timestamp'
          }
        ]
      }),
      new Item({
        name: 'utcnow',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 4,
        href: '#datetime.datetime.utcnow',
        ary: 0
      }),
      new Item({
        name: 'utcoffset',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 3,
        href: '#datetime.datetime.utcoffset',
        ary: 0
      }),
      new Item({
        name: 'utcoffset',
        class: 'time',
        holder: 'datetime.time',
        category: 5,
        type_: 3,
        href: '#datetime.time.utcoffset',
        ary: 0
      }),
      new Item({
        name: 'utcoffset',
        class: 'tzinfo',
        holder: 'datetime.tzinfo',
        category: 6,
        type_: 3,
        href: '#datetime.tzinfo.utcoffset',
        ary: 1,
        arguments: [
          {
            name: 'dt'
          }
        ]
      }),
      new Item({
        name: 'utcoffset',
        class: 'timezone',
        holder: 'datetime.timezone',
        category: 7,
        type_: 3,
        href: '#datetime.timezone.utcoffset',
        ary: 1,
        arguments: [
          {
            name: 'dt'
          }
        ]
      }),
      new Item({
        name: 'utctimetuple',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 3,
        href: '#datetime.datetime.utctimetuple',
        stmt: true,
        ary: 0
      }),
      new Item({
        name: 'weekday',
        class: 'date',
        holder: 'datetime.date',
        category: 3,
        type_: 3,
        href: '#datetime.date.weekday',
        ary: 0
      }),
      new Item({
        name: 'weekday',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 3,
        href: '#datetime.datetime.weekday',
        ary: 0
      }),
      new Item({
        name: 'year',
        class: 'date',
        holder: 'datetime.date',
        category: 3,
        type_: 2,
        href: '#datetime.date.year',
        ary: 0
      }),
      new Item({
        name: 'year',
        class: 'datetime',
        holder: 'datetime.datetime',
        category: 4,
        type_: 2,
        href: '#datetime.datetime.year',
        ary: 0
      })
    ],
    by_name: {
      'MAXYEAR': 0,
      'MINYEAR': 1,
      '__format__': 4,
      '__str__': 7,
      'astimezone': 8,
      'combine': 9,
      'ctime': 11,
      'date': 14,
      'datetime': 16,
      'day': 18,
      'dst': 22,
      'fold': 24,
      'fromordinal': 26,
      'fromtimestamp': 28,
      'fromutc': 30,
      'hour': 32,
      'isocalendar': 34,
      'isoformat': 37,
      'isoweekday': 39,
      'max': 43,
      'microsecond': 45,
      'min': 49,
      'minute': 51,
      'month': 53,
      'now': 54,
      'replace': 57,
      'resolution': 61,
      'second': 63,
      'strftime': 66,
      'strptime': 67,
      'time': 70,
      'timedelta': 72,
      'timestamp': 73,
      'timetuple': 75,
      'timetz': 76,
      'timezone': 78,
      'today': 80,
      'toordinal': 82,
      'total_seconds': 83,
      'tzinfo': 87,
      'tzname': 91,
      'utc': 92,
      'utcfromtimestamp': 93,
      'utcnow': 94,
      'utcoffset': 98,
      'utctimetuple': 99,
      'weekday': 101,
      'year': 103
    },
    by_category: {
      0: [0, 1],
      1: [12, 15, 68, 71, 77, 84],
      2: [40, 46, 58, 72, 83],
      3: [2, 5, 10, 13, 17, 25, 27, 33, 35, 38, 41, 47, 52, 55, 59, 64, 74, 79, 81, 100, 102],
      4: [3, 6, 8, 9, 11, 14, 16, 18, 19, 23, 26, 28, 31, 34, 36, 39, 42, 44, 48, 50, 53, 54, 56, 60, 62, 65, 67, 69, 73, 75, 76, 80, 82, 85, 88, 93, 94, 95, 99, 101, 103],
      5: [4, 7, 20, 24, 32, 37, 43, 45, 49, 51, 57, 61, 63, 66, 70, 86, 89, 96],
      6: [21, 29, 87, 90, 97],
      7: [22, 30, 78, 91, 92, 98]
    },
    by_type: {
      0: [0, 1],
      1: [12, 13, 15, 16, 68, 70, 71, 72, 77, 78, 84, 87],
      2: [17, 18, 23, 24, 31, 32, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 58, 59, 60, 61, 62, 63, 85, 86, 92, 102, 103],
      3: [2, 3, 4, 5, 6, 7, 8, 10, 11, 14, 19, 20, 21, 22, 29, 30, 33, 34, 35, 36, 37, 38, 39, 55, 56, 57, 64, 65, 66, 69, 73, 74, 75, 76, 81, 82, 83, 88, 89, 90, 91, 95, 96, 97, 98, 99, 100, 101],
      4: [9, 25, 26, 27, 28, 54, 67, 79, 80, 93, 94]
    }
  }
  

}) ()


  // This file was generated by `python3 ./bin/helpers/modulebot.py datetime` on 2020-02-12 15:52:53.185674


