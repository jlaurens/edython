/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview cpython's parsetok.c counterpart.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo.Grammar')
goog.require('eYo.Parser')
goog.require('eYo.Scan')
goog.require('eYo.E')

goog.provide('eYo.ParseTok')

/* Parser-tokenizer link implementation *-/

#include "pgenheaders.h"
#include "tokenizer.h"
#include "node.h"
#include "grammar.h"
#include "parser.h"
#include "parsetok.h"
#include "errcode.h"
#include "graminit.h"

/* Forward *-/
static node *parsetok(struct tok_state *, grammar *, int, perrdetail *, int *);
static int initerr(perrdetail *err_ret, PyObject * filename);

/* Parse input coming from a string.  Return error code, print some errors. *-/
node * */
eYo.Parser.PyParser_ParseString = (/* const char * */s, /* grammar * */g, /* int */ start, /* perrdetail * */ err_ret) =>
{
    return eYo.Parser.PyParser_ParseStringFlagsFilename(s, null, g, start, err_ret, 0)
}

/* node * */
eYo.Parser.PyParser_ParseStringFlags = (/* const char * */ s, /* grammar * */ g, /* int */ start,
                          /* perrdetail * */ err_ret, /* int */ flags) =>
{
    return oYo.Do.PyParser_ParseStringFlagsFilename(s, null,
                                             g, start, err_ret, flags)
}

/* node * */
eYo.Parser.PyParser_ParseStringFlagsFilename = (/* const char * */ s, /* const char * */ filename,
                          /* grammar * */ g, /* int */ start,
                          /* perrdetail * */ err_ret, /* int */ flags) =>
{
    var ans = eYo.Parser.PyParser_ParseStringFlagsFilenameEx(s, filename, g, start, err_ret, flags);
    return ans.return
}

/*
node * */
eYo.Parser.PyParser_ParseStringObject = (/* const char * */s, /* PyObject * */filename,
                           /* grammar * */g, /*int*/ start,
                           /* perrdetail * */err_ret, /* int * */flags) =>
{
  var scan = new eYo.Scan()
  initerr(err_ret)
  scan.init(s)
  return eYo.ParseTok.parsetok(scan.first, g, start, err_ret, flags)
}
/*
node *
PyParser_ParseStringFlagsFilenameEx(const char *s, const char *filename_str,
                          grammar *g, int start,
                          perrdetail *err_ret, int *flags)
{
    node *n;
    PyObject *filename = NULL;
#ifndef PGEN
    if (filename_str != NULL) {
        filename = PyUnicode_DecodeFSDefault(filename_str);
        if (filename == NULL) {
            err_ret.error = eYo.E.ERROR;
            return NULL;
        }
    }
#endif
    n = PyParser_ParseStringObject(s, filename, g, start, err_ret, flags);
#ifndef PGEN
    Py_XDECREF(filename);
#endif
    return n;
}

/* Parse input coming from the given tokenizer structure.
   Return error code. *-/

static node *
*/
eYo.ParseTok.parsetok = (/*struct tok_state **/tkn, /*grammar * */g, /*int*/ start, /*perrdetail * */err_ret,
         /*int **/flags) =>
{
  var /*parser_state * */ ps = eYo.Parser.PyParser_New(g, start);
  var /* node * */ n;
  var /*growable_int_array*/ type_ignores;

  for (;;) {
    
    if (tkn.type === eYo.Token.ERRORTOKEN) {
        err_ret.error = tkn.error;
        break;
    }

    if (tkn.type === TYPE_IGNORE) {
      type_ignores.push(tkn.lineno)
      continue;
    }

    var ans = eYo.Parser.PyParser_AddToken(ps, /*(int)type, str,
                            lineno, col_offset, tkn.lineno, end_col_offset*/ tkn)
    err_ret.error = ans.error
    err_ret.expected = ans.expected
    if (err_ret.error != eYo.E.OK) {
      if (err_ret.error != eYo.E.DONE) {
        err_ret.token = tkn.type
      }
      break;
    }
    tkn = tkn.next
  }
  if (err_ret.error === eYo.E.DONE) {
    n = ps.p_tree;
    ps.p_tree = null
    if (n.n_type === file_input) {
      /* Put type_ignore nodes in the ENDMARKER of file_input. */
      var /* int */ num = n.n_nchildren
      var /* node * */ ch = n.n_child[num - 1]
      eYo.Do.goog.asserts.assert(ch.n_type === eYo.Token.ENDMARKER);

      for (var i = 0; i < type_ignores.length; i++) {
          eYo.Do.PyNode_AddChild(ch, eYo.Token.TYPE_IGNORE, null,
          type_ignores[i], 0,
          type_ignores[i], 0);
      }
    }
    /* Check that the source for a single input statement really
        is a single statement by looking at what is left in the
        buffer after parsing.  Trailing whitespace and comments
        are OK.  */
    if (start === eYo.Grammar.single_input) {
      var t = tkn
      while ((t = tkn.next)) {
        if (t.type !== eYo.Token.COMMENT && t.type !== eYo.Token.NEWLINE && t.type !== eYo.Token.ENDMARKER) {
          err_ret.error = eYo.E.BADSINGLE
        }
      }
    }
  }
  else
    n = NULL;
  // PyParser_Delete(ps);

  if (!n) {
    if (tkn.done == eYo.E.EOF)
      err_ret.error = eYo.E.EOF // logically unreachable
    err_ret.lineno = tkn.lineno
    err_ret.text = tkn.content
  }

  if (n != NULL) {
    eYo.Do._PyNode_FinalizeEndPos(n);
  }
  return n;
}

/* static int */
eYo.ParseTok.initerr = (/*perrdetail **/err_ret) =>
{
  err_ret.error = eYo.E.OK;
  err_ret.lineno = 0;
  err_ret.offset = 0;
  err_ret.text = NULL;
  err_ret.token = -1;
  err_ret.expected = -1;
  err_ret.filename = '<string>'
  if (err_ret.filename === null) {
      err_ret.error = eYo.E.ERROR;
      return -1;
  }
  return 0;
}
