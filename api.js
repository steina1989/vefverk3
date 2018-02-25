// https://gist.github.com/subfuzion/669dfae1d1a27de83e69

// Tekka á postman forritinu fyrir http beiðnirnod

// Hægt að gera svona í notes.js . Hann mælti með að gera þetta fyrir async dót.4
// return {
//   error : null,
//   item : item
// }


const express = require('express');
const xss = require('xss');
const { check, validationResult } = require('express-validator/check');

let g_data;
const notfound = { error: "Note not found" };

const {
  create,
  readAll,
  readOne,
  update,
  del,
} = require('./notes');

const router = express.Router();


// Hugmyndin með þessu er að setja þetta utan um handleroute föllin mín.
//  þá get ég catchað fleiri villur og þetta í rauninni reddar þarna
// unhandled promise villuna.
function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

/* todo útfæra api */


function sanitize(req, res, next) {
  const {
    body: {
      title = '',
      text = '',
      datetime = ''
    } = {},
  } = req;

  g_data = {
    title: xss(title),
    text: xss(text),
    datetime: xss(datetime)
  }

  next();
}


router.use(sanitize)

// Vantar validate með að text = string..?
const validate = [
  check('title').isLength({ min: 1, max: 255 })
    .withMessage("Title must be a string of length 1 to 255 characters"),
  check('datetime').isISO8601()
    .withMessage("Datetime must be a ISO 8601 date"),
]

/**
 * READ
 */
router.get('/', async (req, res) => {

  const result = await readAll()
  res.status(200).json(result);
})

router.get('/:id', async (req, res) => {

  const id = req.params.id
  const result = await readOne(id)
  if (!result)
  {
    res.status(404).json(notfound)
  }
  else {
    res.status(200).json(result)
  } 
})


/**
 * CREATE / MODIFY
 */
router.post('/', validate, async (req, res) => {

  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    const fix = validation.array().map(e => {
      return { "field": e.param, "message": e.msg };
    })
    return res.status(400).json(fix).end()
  }

  const result = await create(g_data)
  res.status(201).json(result);
})

router.put('/:id', validate, async (req, res) => {

  const validation = validationResult(req.body);
  if (!validation.isEmpty()) {
    const fix = validation.array().map(e => {
      return { "field": e.param, "message": e.msg };
    })
    return res.status(400).json(fix).end()
  }

  const id = parseInt(req.params.id)
  const result = await update(id, g_data)
  // þarf að höndla þetta frekar spes.
  if (result.success) {
    res.status(200).json(result.rows)
  }
  else res.status(404).json(notfound)

})

router.delete('/:id', async (req, res) => {

  const id = parseInt(req.params.id)
  const result = await del(id)
  if (result) {
    res.status(204).end();
  }
  else {
    res.status(404).json(notfound)
  }
})


module.exports = router;
