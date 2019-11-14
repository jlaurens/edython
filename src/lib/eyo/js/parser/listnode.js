/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview cpython's listnode.c counterparts.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo.Node')

goog.provide('eYo.Node.List')

/* List a node on a file *-/

#include "pgenheaders.h"
#include "token.h"
#include "node.h"

/* Forward *-/
static void list1node(FILE *, node *);
static void listnode(FILE *, node *);
*/
;(function(){
/* void */
  eYo.Node.PyNode_ListTree = (/* node * */ n) =>
  {
    listnode(/*stdout, */n);
  }

  //static int
  var level, atbol

  // static void
  var listnode = (/* FILE *fp, node * */ n) =>
  {
    level = 0;
    atbol = 1;
    list1node(/*fp, */n);
  }

  // static void
  var list1node = (/* FILE *fp, node * */ n) =>
  {
    if (!n) {
      return;
    }
    if (eYo.TKN.ISNONTERMINAL(n.n_type)) {
        for (var i = 0; i < n.n_nchildren; i++) {
          list1node(/*fp, */n.n_child[i])
        }
    }
    else if (eYo.TKN.ISTERMINAL(n.n_type)) {
      switch (n.n_type) {
      case eYo.TKN.INDENT:
        ++level;
        break;
      case eYo.TKN.DEDENT:
        --level;
        break;
      default:
        if (atbol) {
          for (i = 0; i < level; ++i) {
            console.log("  ")
          }
          atbol = 0;
        }
        if (n.n_type === eYo.TKN.NEWLINE) {
          if (n.n_str) {
            console.log(`<${n.n_str}>(${eYo.TKN._NAMES[n.n_type]})`)
          }
          console.log("\n")
          atbol = 1
        } else {
          console.log(`<${n.n_str}>(${eYo.TKN._NAMES[n.n_type]}) `)
        }
        break;
      }
    } else {
      console.log("? ", n.n_type)
    }
  }
})()