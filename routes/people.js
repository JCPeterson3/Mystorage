const express = require('express')
const router = express.Router()
const Person = require('../models/person')
const Book = require('../models/book')

// All People Route
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const people = await Person.find(searchOptions)
        res.render('people/index', {
            people: people,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

// New Person Route
router.get('/new', (req, res) => {
    res.render('people/new', { person: new Person() })
})

// Create Person Route
router.post('/', async (req, res) => {
    const person = new Person({
        name: req.body.name
    })

    try {
        const newPerson = await person.save()
        res.redirect(`people/${newPerson.id}`)
    } catch {
        res.render('people/new', {
            person: person,
            errorMessage: 'Error creating Person'
        })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const person = await Person.findById(req.params.id)
        const books = await Book.find({ person: person.id }).exec()
        res.render('people/show', {
            person: person,
            booksPersonWants: books
        })
    } catch {
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        const person = await Person.findById(req.params.id)
        res.render('people/edit', { person: person })
    } catch {
        res.redirect('/people')
    }
})

router.put('/:id', async (req, res) => {
    let person
    try {
        person = await Person.findById(req.params.id)
        person.name = req.body.name
        await person.save()
        res.redirect(`/people/${person.id}`)
    } catch {
        if (person == null) {
            res.redirect('/')
        } else {
            res.render('people/edit', {
                person: person,
                errorMessage: 'Error updating Person'
            })
        }
    }
})

// Delete Person Route
router.delete('/:id', async (req, res) => {
    let person
    try {
        person = await Person.findById(req.params.id)
        await person.remove()
        res.redirect(`/people`)
    } catch {
        if (person == null) {
            res.redirect('/')
        } else {
            res.redirect(`/people/${person.id}`)
        }
    }
})

module.exports = router