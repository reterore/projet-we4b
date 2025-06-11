const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// GET all
router.get('/', async (req, res) => {
    const courses = await Course.find();
    res.json(courses);
});

// GET one
router.get('/:id', async (req, res) => {
    const course = await Course.findById(req.params.id);
    res.json(course);
});

// POST create
router.post('/', async (req, res) => {
    const { title, description, teacherId } = req.body;
    const newCourse = new Course({ title, description, teacherId });
    await newCourse.save();
    res.status(201).json(newCourse);
});

// PUT update
router.put('/:id', async (req, res) => {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(course);
});

// DELETE
router.delete('/:id', async (req, res) => {
    await Course.findByIdAndDelete(req.params.id);
    res.status(204).end();
});

module.exports = router;
