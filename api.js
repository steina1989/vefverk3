const express = require('express');
const xss = require('xss');
const { check, validationResult } = require('express-validator/check');

let gData;
const notfound = { error: 'Note not found' };

const {
  create,
  readAll,
  readOne,
  update,
  del,
} = require('./notes');

const router = express.Router();

function sanitize(req, res, next) {
  const {
    body: {
      title = '',
      text = null,
      datetime = '',
    } = {},
  } = req;

  gData = {
    title: xss(title),
    text: xss(text),
    datetime: xss(datetime),
  };

  next();
}


router.use(sanitize);

// Vantar validate með að text = string..?
const validate = [
  check('title').isLength({ min: 1, max: 255 })
    .withMessage('Title must be a string of length 1 to 255 characters'),
  check('text').custom(value => (typeof (value) === 'string'))
    .withMessage('Text should be a string.'),
  check('datetime').isISO8601()
    .withMessage('Datetime must be a ISO 8601 date'),
];

/**
 * READ
 */
router.get('/', async (req, res) => {
  const result = await readAll();
  res.status(200).json(result);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const result = await readOne(id);
  if (!result) {
    res.status(404).json(notfound);
  } else {
    res.status(200).json(result);
  }
});


/**
 * CREATE / MODIFY
 */
router.post('/', validate, async (req, res) => {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    const valArray = validation.array();
    const fix = [];
    for (let x = 0; x < valArray.length; x += 1) {
      const elem = valArray[x];
      fix.push({ field: elem.param, message: elem.msg });
    }
    return res.status(400).json(fix).end();
  }

  const result = await create(gData);
  return res.status(201).json(result);
});

router.put('/:id', validate, async (req, res) => {
  const validation = validationResult(req.body);
  if (!validation.isEmpty()) {
    const valArray = validation.array();
    const fix = [];
    for (let x = 0; x < valArray.length; x += 1) {
      const elem = valArray[x];
      fix.push({ field: elem.param, message: elem.msg });
    }
    res.status(400).json(fix).end();
  }

  const id = parseInt(req.params.id, 10);
  const result = await update(id, gData);
  if (result) {
    res.status(201).json(result);
  } else {
    res.status(404).json(notfound);
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const result = await del(id);
  if (result) {
    res.status(204).end();
  } else {
    res.status(404).json(notfound);
  }
});


module.exports = router;
