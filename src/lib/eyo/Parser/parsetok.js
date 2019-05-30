/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview cpython's parsetok.c counterpart.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.ParseTok')

goog.require('eYo')

goog.require('eYo.GMR.Init')
goog.require('eYo.Parser')
goog.require('eYo.Scan')
goog.require('eYo.E')

;(function(){

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
static node *parsetok(struct tok_state *, grammar *, int, perrdetail *, int *); // NO flags
static int initerr(perrdetail *err_ret, PyObject * filename);

/* Parse input coming from a string.  Return error code, print some errors. *-/
node * */
eYo.Parser.PyParser_ParseString = (/* const char * */s, /* grammar * */g, /* int */ start, /* perrdetail * */ err_ret) =>
{
  var scan = new eYo.Scan()
  initerr(err_ret)
  scan.init(s, start)
  return parsetok(scan, g, start, err_ret)
}

/* node *
PyParser_ParseStringFlags(const char *s, grammar *g, int start,
  perrdetail *err_ret, int flags)
{
return PyParser_ParseStringFlagsFilename(s, NULL,
                     g, start, err_ret, flags);
}

node *
PyParser_ParseStringFlagsFilename(const char *s, const char *filename,
  grammar *g, int start,
  perrdetail *err_ret, int flags)
{
int iflags = flags;
return PyParser_ParseStringFlagsFilenameEx(s, filename, g, start,
                       err_ret, &iflags);
}

/* node *
PyParser_ParseStringObject(const char *s, PyObject *filename,
                           grammar *g, int start,
                           perrdetail *err_ret, int *flags)
{
    struct tok_state *tok;
    int exec_input = start == file_input;

    if (initerr(err_ret, filename) < 0)
        return NULL;

    if (*flags & PyPARSE_IGNORE_COOKIE)
        tok = PyTokenizer_FromUTF8(s, exec_input);
    else
        tok = PyTokenizer_FromString(s, exec_input);
    if (tok == NULL) {
        err_ret->error = PyErr_Occurred() ? E_DECODE : E_NOMEM;
        return NULL;
    }
    if (*flags & PyPARSE_TYPE_COMMENTS) {
        tok->type_comments = 1;
    }

#ifndef PGEN
    Py_INCREF(err_ret->filename);
    tok->filename = err_ret->filename;
#endif
    return parsetok(tok, g, start, err_ret, flags);
}

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
   Return error code. */

/* static node * */
var parsetok = (/*struct tok_state **/scan, /*grammar * */g, /*int*/ start, /*perrdetail * */err_ret/*,
         int *flags*/) =>
{
  var /*parser_state * */ ps = eYo.Parser.PyParser_New(scan, g, start)
  var /* node * */ parent
  var /*growable_int_array*/ type_ignores = []
  var tkn = scan.first

  for (;;) {
    console.error('ERASE ME tkn.name:', tkn.name)
    if (tkn.type === eYo.TKN.ERRORTOKEN) {
        err_ret.error = tkn.error;
        break;
    }

    if (tkn.type === eYo.TKN.TYPE_IGNORE) {
      type_ignores.push(tkn.lineno)
      if((tkn = tkn.next)) {
        continue
      } else {
        break
      }
    }
    if (tkn.n_type === eYo.TKN.COMMENT) {
      var comment = new eYo.Node(tkn.scan, tkn.n_type)
      comment.lineno = tkn.lineno
      comment.end_lineno = tkn.end_lineno
      comment.start_comment = tkn.start_comment
      // store the comment in the last token
      ps.p_stack.last_tkn.pushComment(comment)
      if((tkn = tkn.next)) {
        continue
      }
      break
    } else {
      ps.p_stack.last_tkn = tkn
      var ans = eYo.Parser.PyParser_AddToken(ps, /*(int)type, str,
      linen0, c0l_offset, tkn.linen0, end_col_0ffset, */ tkn)
      err_ret.error = ans.error
      err_ret.expected = ans.expected
      if (err_ret.error !== eYo.E.OK) {
        if (err_ret.error !== eYo.E.DONE) {
          err_ret.token = tkn.type
        }
        break
      }
    }
    // we have scanned something meaningful
    if((tkn = tkn.next)) {
      continue
    }
    break
  }
  if (err_ret.error === eYo.E.DONE) {
    parent = ps.p_tree;
    ps.p_tree = null
    if (parent.n_type === eYo.TKN.file_input) {
      /* Put type_ignore nodes in the ENDMARKER of file_input. */
      var /* int */ num = parent.n_nchildren
      var /* node * */ ch = parent.n_child[num - 1]
      goog.asserts.assert(ch.n_type === eYo.TKN.ENDMARKER);

      for (var i = 0; i < type_ignores.length; i++) {
          eYo.Do.PyNode_AddChild(ch, eYo.TKN.TYPE_IGNORE, null,
          type_ignores[i], 0,
          type_ignores[i], 0);
      }
    }
    /* Check that the source for a single input statement really
        is a single statement by looking at what is left in the
        buffer after parsing.  Trailing whitespace and comments
        are OK.  */
    if (start === eYo.TKN.single_input) {
      var t = scan.nextToken()
      while (t) {
        if (t.type !== eYo.TKN.COMMENT && t.type !== eYo.TKN.NEWLINE && t.type !== eYo.TKN.ENDMARKER) {
          err_ret.error = eYo.E.BADSINGLE
          console.error('UNEXPECTED', t.type, eYo.TKN._NAMES[t.type])
          break
        }
        t = t.next
      }
    }
    eYo.Node._PyNode_FinalizeEndPos(parent)
  }
  else
    /* n = null
  // PyParser_Delete(ps);

  if (!n)*/ {
    if (scan.done === eYo.E.EOF)
      err_ret.error = eYo.E.EOF // logically unreachable
    err_ret.lineno = scan.last.lineno
    err_ret.text = scan.last.content
  }

  // if (n != null) {
  //   eYo.Node._PyNode_FinalizeEndPos(n)
  // }
  return parent
}

/* static int */
var initerr = (/*perrdetail **/err_ret) =>
{
  err_ret.error = eYo.E.OK;
  err_ret.lineno = 0;
  err_ret.offset = 0;
  err_ret.text = null;
  err_ret.token = -1;
  err_ret.expected = -1;
  err_ret.filename = '<string>'
  if (err_ret.filename === null) {
      err_ret.error = eYo.E.ERROR;
      return -1;
  }
  return 0;
}
})()
