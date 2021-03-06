const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const Person = require('../models/person')
const { redirect } = require('express/lib/response')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

// All Books Route
router.get('/', async (req, res) => {
    let query = Book.find()
    const everyBook = await Book.find()
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    try {
        const books = await query.exec()
        res.render('books/index', {
            books: books,
            searchOptions: req.query,
            allBooks: everyBook
        })
    } catch {
        res.redirect('/')
    }
})

// New Book Route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
})

// Create Book Route
router.post('/', async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        copies: req.body.copies,
        person: req.body.persons,
        description: req.body.description
    })
    saveCover(book, req.body.cover)

    try {
        const newBook = await book.save()
        res.redirect(`books/${newBook.id}`)
    } catch {
        renderNewPage(res, book, true)
    }
})

// Show Book Route
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author person').exec()
        res.render('books/show', { book: book })
    } catch {
        res.redirect('/')
    }
})

// Edit Book Route
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        renderEditPage(res, book)
    } catch {
        res.reditrect('/')
    }
})

// Update Book Route
router.put('/:id', async (req, res) => {
    let book

    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.person = req.body.persons
        book.copies = req.body.copies
        book.description = req.body.description
        if (req.body.cover != null && req.body.cover !== '') {
            saveCover(book, req.body.cover)
        }
        await book.save()
        res.redirect(`/books/${book.id}`)
    } catch {
        if (book != null) {
            renderEditPage(res, book, true)
        } else {
            redirect('/')
        }
    }
})

// Delete Book Page
router.delete('/:id', async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    } catch {
        if (book != null) {
            res.render('books/show', {
                book: book,
                errorMessage: 'Could not remove book'
            })
        } else {
            res.redirect('/')
        }
    }
})

async function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false) {
    try {
        const authors = await Author.find({})
        const persons = await Person.find({})
        const params = {
            authors: authors,
            persons: persons,
            book: book
        }
        if (hasError) {
            if (form === 'edit') {
                params.errorMessage = 'Error Updating Book'
            } else {
                params.errorMessage = 'Error Creating Book'
            }
        }
        res.render(`books/${form}`, params)
    } catch {
        res.redirect('/books')
    }
}

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return

    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}

module.exports = router